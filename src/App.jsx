import { useMemo, useState } from "react";
import "./index.css";

const LEVELS = [
  {
    name: "Nivel 1",
    min: 0,
    label: "Base",
    benefit: "Acceso inicial al programa y beneficios de entrada.",
  },
  {
    name: "Nivel 2",
    min: 500,
    label: "Plus",
    benefit: "Mejores reintegros, descuentos y recompensas destacadas.",
  },
  {
    name: "Nivel 3",
    min: 900,
    label: "Premium",
    benefit: "Máximo nivel de beneficios, experiencias y condiciones preferenciales.",
  },
];

const formatNumber = (value) => {
  return new Intl.NumberFormat("es-AR").format(value || 0);
};

function App() {
  const [productos, setProductos] = useState({
    servicioSelecta: true,
    sueldo: false,
    prestamos: 0,
    debitos: 0,
    seguros: 0,
  });

  const [altas, setAltas] = useState({
    altaSueldo: false,
    upgradePaquete: false,
    altaTarjeta: false,
    seguroHogarAuto: false,
  });

  const [ahorro, setAhorro] = useState(0);
  const [consumo, setConsumo] = useState(0);

  const puntosProductos = useMemo(() => {
    const base = productos.servicioSelecta ? 25 : 0;
    const sueldo = productos.sueldo ? 100 : 0;
    const prestamos = Math.min(Number(productos.prestamos) || 0, 5) * 25;
    const debitos = Math.min(Number(productos.debitos) || 0, 5) * 25;
    const seguros = Math.min(Number(productos.seguros) || 0, 5) * 25;

    return Math.min(base + sueldo + prestamos + debitos + seguros, 500);
  }, [productos]);

  const puntosAltas = useMemo(() => {
    return (
      (altas.altaSueldo ? 200 : 0) +
      (altas.upgradePaquete ? 100 : 0) +
      (altas.altaTarjeta ? 50 : 0) +
      (altas.seguroHogarAuto ? 100 : 0)
    );
  }, [altas]);

  const puntosAhorro = useMemo(() => {
    return Math.min(Math.floor((Number(ahorro) || 0) / 100000), 200);
  }, [ahorro]);

  const puntosConsumo = useMemo(() => {
    return Math.floor((Number(consumo) || 0) / 100000);
  }, [consumo]);

  const totalPuntos =
    puntosProductos + puntosAltas + puntosAhorro + puntosConsumo;

  const currentLevel = useMemo(() => {
    if (totalPuntos >= 900) return LEVELS[2];
    if (totalPuntos >= 500) return LEVELS[1];
    return LEVELS[0];
  }, [totalPuntos]);

  const nextLevel = useMemo(() => {
    if (totalPuntos < 500) return LEVELS[1];
    if (totalPuntos < 900) return LEVELS[2];
    return null;
  }, [totalPuntos]);

  const pointsToNext = nextLevel ? nextLevel.min - totalPuntos : 0;

  const progress = useMemo(() => {
    if (totalPuntos >= 900) return 100;
    return Math.min((totalPuntos / 900) * 100, 100);
  }, [totalPuntos]);

  const suggestedAction = useMemo(() => {
    if (totalPuntos >= 900) {
      return "Ya alcanzaste el Nivel 3. La prioridad es mantener tus hábitos para conservar el máximo nivel.";
    }

    if (!productos.sueldo && !altas.altaSueldo) {
      return "Adherí débitos automáticos, sumá consumos con tarjeta o incrementá tu saldo en cuenta/inversiones para acercarte al próximo nivel.";
    }

    if (Number(consumo) < 300000) {
      return "Concentrá tus consumos con tarjeta de débito o crédito Macro para sumar más puntos este mes.";
    }

    if (Number(ahorro) < 1000000) {
      return "Aumentá tu saldo vista, plazo fijo o FCI para sumar puntos desde la meta de ahorro e inversión.";
    }

    return "Sumá nuevos débitos automáticos o productos activos para acelerar tu avance al próximo nivel.";
  }, [totalPuntos, productos.sueldo, altas.altaSueldo, consumo, ahorro]);

  const resetCalculator = () => {
    setProductos({
      servicioSelecta: true,
      sueldo: false,
      prestamos: 0,
      debitos: 0,
      seguros: 0,
    });

    setAltas({
      altaSueldo: false,
      upgradePaquete: false,
      altaTarjeta: false,
      seguroHogarAuto: false,
    });

    setAhorro(0);
    setConsumo(0);
  };

  return (
    <main className="app">
      <section className="hero">
        <div>
          <span className="eyebrow">Banco Macro · Loyalty 3.0</span>
          <h1>Calculadora de Nivel</h1>
          <p>
            Simulá cómo las metas del cliente impactan en su nivel mensual y qué
            acciones pueden ayudarlo a desbloquear mejores recompensas.
          </p>
        </div>

        <div className="level-card">
          <span className="level-label">{currentLevel.label}</span>
          <h2>{currentLevel.name}</h2>
          <p>{currentLevel.benefit}</p>

          <div className="points">
            <strong>{formatNumber(totalPuntos)}</strong>
            <span>puntos acumulados</span>
          </div>
        </div>
      </section>

      <section className="dashboard">
        <div className="panel calculator">
          <div className="panel-header">
            <div>
              <h2>Metas del cliente</h2>
              <p>Completá los datos para calcular el nivel estimado.</p>
            </div>
            <button className="secondary-button" onClick={resetCalculator}>
              Reiniciar
            </button>
          </div>

          <div className="goal-block">
            <div className="goal-title">
              <span>01</span>
              <div>
                <h3>Tus productos suman</h3>
                <p>Productos activos y relación mensual con el banco.</p>
              </div>
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                checked={productos.servicioSelecta}
                onChange={(e) =>
                  setProductos({
                    ...productos,
                    servicioSelecta: e.target.checked,
                  })
                }
              />
              <span>Servicio Macro Selecta activo</span>
              <strong>25 pts</strong>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={productos.sueldo}
                onChange={(e) =>
                  setProductos({ ...productos, sueldo: e.target.checked })
                }
              />
              <span>Acreditación de sueldo/haberes activa</span>
              <strong>100 pts</strong>
            </label>

            <div className="input-grid">
              <label>
                Préstamos en regularidad
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={productos.prestamos}
                  onChange={(e) =>
                    setProductos({ ...productos, prestamos: e.target.value })
                  }
                />
              </label>

              <label>
                Débitos automáticos
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={productos.debitos}
                  onChange={(e) =>
                    setProductos({ ...productos, debitos: e.target.value })
                  }
                />
              </label>

              <label>
                Seguros activos
                <input
                  type="number"
                  min="0"
                  max="5"
                  value={productos.seguros}
                  onChange={(e) =>
                    setProductos({ ...productos, seguros: e.target.value })
                  }
                />
              </label>
            </div>
          </div>

          <div className="goal-block">
            <div className="goal-title">
              <span>02</span>
              <div>
                <h3>Solicitar productos</h3>
                <p>Altas realizadas durante el mes.</p>
              </div>
            </div>

            <label className="check-row">
              <input
                type="checkbox"
                checked={altas.altaSueldo}
                onChange={(e) =>
                  setAltas({ ...altas, altaSueldo: e.target.checked })
                }
              />
              <span>Alta de acreditación de sueldo/haberes</span>
              <strong>200 pts</strong>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={altas.upgradePaquete}
                onChange={(e) =>
                  setAltas({ ...altas, upgradePaquete: e.target.checked })
                }
              />
              <span>Alta o upgrade de paquete</span>
              <strong>100 pts</strong>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={altas.altaTarjeta}
                onChange={(e) =>
                  setAltas({ ...altas, altaTarjeta: e.target.checked })
                }
              />
              <span>Alta de tarjeta titular/adicional</span>
              <strong>50 pts</strong>
            </label>

            <label className="check-row">
              <input
                type="checkbox"
                checked={altas.seguroHogarAuto}
                onChange={(e) =>
                  setAltas({ ...altas, seguroHogarAuto: e.target.checked })
                }
              />
              <span>Alta de seguro hogar/auto</span>
              <strong>100 pts</strong>
            </label>
          </div>

          <div className="goal-block">
            <div className="goal-title">
              <span>03</span>
              <div>
                <h3>Ahorrar e invertir</h3>
                <p>Saldo acumulado entre caja de ahorro, plazo fijo y FCI.</p>
              </div>
            </div>

            <label className="money-input">
              Saldo promedio mensual
              <input
                type="number"
                min="0"
                value={ahorro}
                onChange={(e) => setAhorro(e.target.value)}
                placeholder="Ej: 2000000"
              />
            </label>
          </div>

          <div className="goal-block">
            <div className="goal-title">
              <span>04</span>
              <div>
                <h3>Comprar y pagar</h3>
                <p>Consumos con tarjeta, pagos, recargas y débitos.</p>
              </div>
            </div>

            <label className="money-input">
              Consumo mensual total
              <input
                type="number"
                min="0"
                value={consumo}
                onChange={(e) => setConsumo(e.target.value)}
                placeholder="Ej: 800000"
              />
            </label>
          </div>
        </div>

        <aside className="panel summary">
          <h2>Resultado estimado</h2>

          <div className="summary-level">
            <span>Nivel actual</span>
            <strong>{currentLevel.name}</strong>
          </div>

          <div className="progress-area">
            <div className="progress-info">
              <span>Progreso hacia Nivel 3</span>
              <strong>{Math.round(progress)}%</strong>
            </div>
            <div className="progress-bar">
              <div style={{ width: `${progress}%` }} />
            </div>
          </div>

          {nextLevel ? (
            <div className="next-level">
              Te faltan <strong>{formatNumber(pointsToNext)} puntos</strong>{" "}
              para alcanzar <strong>{nextLevel.name}</strong>.
            </div>
          ) : (
            <div className="next-level success">
              Cliente en máximo nivel. Objetivo: sostener comportamiento.
            </div>
          )}

          <div className="points-breakdown">
            <h3>Detalle de puntos</h3>

            <div>
              <span>Productos</span>
              <strong>{formatNumber(puntosProductos)}</strong>
            </div>

            <div>
              <span>Altas del mes</span>
              <strong>{formatNumber(puntosAltas)}</strong>
            </div>

            <div>
              <span>Ahorro e inversión</span>
              <strong>{formatNumber(puntosAhorro)}</strong>
            </div>

            <div>
              <span>Compras y pagos</span>
              <strong>{formatNumber(puntosConsumo)}</strong>
            </div>
          </div>

          <div className="suggestion">
            <span>Acción sugerida</span>
            <p>{suggestedAction}</p>
          </div>
        </aside>
      </section>
    </main>
  );
}

export default App;