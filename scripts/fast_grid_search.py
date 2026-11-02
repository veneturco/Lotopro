import json
import numpy as np

# Cargar dataset
data = json.load(open('src/constants/historicoBase.json', encoding='utf-8'))

def norm_id(val):
    if val is None: return None
    s = str(val).strip()
    if s in ['00', '37']: return '00'
    if s == '0': return '0'
    try:
        n = int(s)
        if 0 <= n <= 36: return str(n)
    except:
        pass
    return None

dataset = []
for x in data:
    la = norm_id(x.get('number_animal'))
    gr = norm_id(x.get('gr'))
    if la:
        dataset.append({
            'la': la,
            'gr': gr,
            'hora': x.get('time_s'),
            'fecha': x.get('date_result')
        })

N_DATA = len(dataset)
KEYS = [
    "0", "00", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10",
    "11", "12", "13", "14", "15", "16", "17", "18", "19", "20",
    "21", "22", "23", "24", "25", "26", "27", "28", "29", "30",
    "31", "32", "33", "34", "35", "36"
]
KEY_TO_IDX = {k: i for i, k in enumerate(KEYS)}
K = 38
P_UNIF = 1.0 / K

CILINDRO = [
    "0", "28", "9", "26", "30", "11", "7", "20", "32", "17",
    "5", "22", "34", "15", "3", "24", "36", "13", "1", "00",
    "27", "10", "25", "29", "12", "8", "19", "31", "18", "6",
    "21", "33", "16", "4", "23", "35", "14", "2"
]
CIL_IDX = {k: i for i, k in enumerate(CILINDRO)}

def dist_cil(a, b):
    ia = CIL_IDX.get(a, 0)
    ib = CIL_IDX.get(b, 0)
    d = abs(ia - ib)
    return min(d, K - d)

# Matrices precalculadas en enteros
la_indices = np.array([KEY_TO_IDX[x['la']] for x in dataset], dtype=np.int32)
gr_indices = np.array([KEY_TO_IDX[x['gr']] if x['gr'] in KEY_TO_IDX else -1 for x in dataset], dtype=np.int32)

print(f"Dataset precalculado: {N_DATA} sorteos.")

# Evaluación vectorizada ultra-rápida (50-100 ms por simulación completa)
def run_eval(w_freq=0.28, w_atraso=0.20, w_m1=0.08, w_m2=0.24, w_m12=0.04, w_m24=0.04,
             w_cross=0.08, w_geom=0.04, pen_hoy=0.45, start_idx=100, bat_resonancia=False):
    total = N_DATA - start_idx
    hits_fijo = 0
    hits_def = 0
    hits_bat = 0
    hits_top3 = 0

    # Historial acumulado en arrays
    counts_la = np.zeros(K, dtype=np.float32)
    last_seen = np.full(K, -1, dtype=np.int32)
    
    # Transiciones acumuladas: m1[prev, next], m2[prev2, next]
    trans_m1 = np.zeros((K, K), dtype=np.int32)
    trans_m2 = np.zeros((K, K), dtype=np.int32)
    trans_m12 = np.zeros((K, K), dtype=np.int32)
    trans_m24 = np.zeros((K, K), dtype=np.int32)
    trans_cross = np.zeros((K, K), dtype=np.int32)

    # Llenar hasta start_idx
    for i in range(start_idx):
        curr = la_indices[i]
        counts_la[curr] += 1
        last_seen[curr] = i
        if i >= 1:
            trans_m1[la_indices[i-1], curr] += 1
        if i >= 2:
            trans_m2[la_indices[i-2], curr] += 1
        if i >= 12:
            trans_m12[la_indices[i-12], curr] += 1
        if i >= 24:
            trans_m24[la_indices[i-24], curr] += 1
        if i >= 1 and gr_indices[i-1] >= 0:
            trans_cross[gr_indices[i-1], curr] += 1

    # Walk forward
    current_date = dataset[start_idx-1]['fecha']
    seen_today = set()

    for idx in range(start_idx, N_DATA):
        fecha = dataset[idx]['fecha']
        if fecha != current_date:
            current_date = fecha
            seen_today.clear()

        # Vector de features para cada candidato k
        prev1 = la_indices[idx-1]
        prev2 = la_indices[idx-2]
        prev12 = la_indices[idx-12]
        prev24 = la_indices[idx-24]
        prev_gr = gr_indices[idx-1]

        # 1. Frecuencia
        subN = idx
        s_freq = (counts_la / subN) / P_UNIF

        # 2. Atraso
        atrasos = idx - 1 - last_seen # array de K
        # Modelo harmónico continuo
        s_atraso = np.zeros(K, dtype=np.float32)
        mask_gold = (atrasos >= 9) & (atrasos <= 24)
        mask_silver = (atrasos >= 25) & (atrasos <= 42)
        mask_bronze = (atrasos > 42) & (atrasos <= 65)
        mask_cage = (atrasos > 65)
        mask_fresh = (atrasos >= 1) & (atrasos <= 8)
        mask_zero = (atrasos == 0)

        s_atraso[mask_gold] = 1.0
        s_atraso[mask_silver] = 0.72
        s_atraso[mask_bronze] = 0.50
        s_atraso[mask_cage] = 0.35
        s_atraso[mask_fresh] = 0.20
        s_atraso[mask_zero] = 0.02

        # 3. Markov
        t1_total = np.sum(trans_m1[prev1, :])
        t2_total = np.sum(trans_m2[prev2, :])
        t12_total = np.sum(trans_m12[prev12, :])
        t24_total = np.sum(trans_m24[prev24, :])

        p_m1 = (trans_m1[prev1, :] + 1.0) / (t1_total + K)
        p_m2 = (trans_m2[prev2, :] + 1.0) / (t2_total + K)
        p_m12 = (trans_m12[prev12, :] + 1.0) / (t12_total + K)
        p_m24 = (trans_m24[prev24, :] + 1.0) / (t24_total + K)

        s_m1 = p_m1 / P_UNIF
        s_m2 = p_m2 / P_UNIF
        s_m12 = p_m12 / P_UNIF
        s_m24 = p_m24 / P_UNIF

        # 4. Cruce Granjita
        if prev_gr >= 0:
            tc_total = np.sum(trans_cross[prev_gr, :])
            p_cross = (trans_cross[prev_gr, :] + 1.0) / (tc_total + K)
            s_cross = p_cross / P_UNIF
        else:
            s_cross = np.ones(K, dtype=np.float32)

        # Score Compuesto
        score = (w_freq * s_freq +
                 w_atraso * s_atraso +
                 w_m1 * s_m1 +
                 w_m2 * s_m2 +
                 w_m12 * s_m12 +
                 w_m24 * s_m24 +
                 w_cross * s_cross)

        # Penalización
        for k_idx in seen_today:
            score[k_idx] *= pen_hoy
        score[prev1] *= 0.05 # no repetición consecutiva

        # Ranking Top 3
        top_order = np.argsort(score)[::-1]
        fijo = top_order[0]
        defensa = top_order[1]
        
        if bat_resonancia:
            # Buscar en top 10 el mejor en ventana dorada
            pool = [cand for cand in top_order[1:10] if cand != fijo and cand != defensa]
            res_cand = [cand for cand in pool if 12 <= atrasos[cand] <= 24]
            batacazo = res_cand[0] if res_cand else pool[0]
        else:
            batacazo = top_order[2]

        actual = la_indices[idx]
        if actual == fijo: hits_fijo += 1
        if actual == defensa: hits_def += 1
        if actual == batacazo: hits_bat += 1
        if actual in [fijo, defensa, batacazo]: hits_top3 += 1

        # Actualizar historial
        counts_la[actual] += 1
        last_seen[actual] = idx
        seen_today.add(actual)

        trans_m1[prev1, actual] += 1
        trans_m2[prev2, actual] += 1
        trans_m12[prev12, actual] += 1
        trans_m24[prev24, actual] += 1
        if prev_gr >= 0:
            trans_cross[prev_gr, actual] += 1

    p_top3 = (hits_top3 / total) * 100.0
    edge = p_top3 - (3.0 / 38.0 * 100.0)
    lift = p_top3 / (3.0 / 38.0 * 100.0)
    return {
        'total': total,
        'hits': hits_top3,
        'p_top3': p_top3,
        'edge': edge,
        'lift': lift,
        'fijo': hits_fijo,
        'def': hits_def,
        'bat': hits_bat
    }

print("Ejecutando prueba rápida...")
res0 = run_eval()
print(f"Baseline vectorizado -> Top 3: {res0['p_top3']:.2f}% (Edge: +{res0['edge']:.2f}%, Lift: {res0['lift']:.2f}x) | Fijo: {res0['fijo']}, Def: {res0['def']}, Bat: {res0['bat']}")

# Optimización por barrido sistemático (1,500 combinaciones en 15 segundos)
print("\nBarrido sistemático de combinaciones...")
best = []

for w_f in [0.20, 0.25, 0.30, 0.35]:
    for w_a in [0.15, 0.20, 0.25]:
        for w_m2 in [0.20, 0.28, 0.35, 0.42]:
            for w_m1 in [0.04, 0.08, 0.12]:
                for w_c in [0.04, 0.08, 0.12]:
                    for p_hoy in [0.35, 0.50, 0.70]:
                        for bat_res in [False, True]:
                            r = run_eval(w_freq=w_f, w_atraso=w_a, w_m1=w_m1, w_m2=w_m2,
                                         w_m12=0.04, w_m24=0.04, w_cross=w_c, pen_hoy=p_hoy,
                                         bat_resonancia=bat_res)
                            if r['p_top3'] >= 9.0:
                                best.append((r['p_top3'], r, {
                                    'w_freq': w_f, 'w_atraso': w_a, 'w_m1': w_m1, 'w_m2': w_m2,
                                    'w_cross': w_c, 'pen_hoy': p_hoy, 'bat_res': bat_res
                                }))

best.sort(key=lambda x: x[0], reverse=True)
print(f"\nTotal combinaciones con >= 9.0% Top 3: {len(best)}")
print("\n=== TOP 5 MEJORES CONFIGURACIONES MATEMÁTICAS ===")
for i, (score, r, cfg) in enumerate(best[:5]):
    print(f"\n#{i+1} -> Top 3: {score:.2f}% (Edge: +{r['edge']:.2f}%, Lift: {r['lift']:.2f}x)")
    print(f"      Desglose aciertos: Fijo: {r['fijo']}, Defensa: {r['def']}, Batacazo: {r['bat']}")
    print(f"      Hiperparámetros: {cfg}")
