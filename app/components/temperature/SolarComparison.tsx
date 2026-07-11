import { formatTemperature } from "../../lib/format";
import { ui } from "../../lib/uiStyles";

type SolarComparisonProps = {
  progress: number;
  ratio: number;
  showProgress: boolean;
};

export function SolarComparison({
  progress,
  ratio,
  showProgress,
}: SolarComparisonProps) {
  return (
    <div className="mt-5 border-t border-edge-subtle pt-5">
      <div className={ui.headingRow}>
        <div>
          <h2 className={ui.sectionTitle}>絕對溫度比較</h2>
          <p className={ui.fieldHelp}>以 Kelvin 比較太陽光球層約 5,778 K</p>
        </div>
        <strong className="text-accent [font-variant-numeric:tabular-nums]">
          {showProgress ? `${formatTemperature(ratio)}%` : "--"}
        </strong>
      </div>
      <div
        className="mt-3 h-1.5 w-full overflow-hidden rounded bg-surface-muted"
        role="progressbar"
        aria-label="相對於太陽表面絕對溫度"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <span
          className="block h-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
      <p className={ui.fieldHelp}>
        此比例只比較絕對溫度，不代表物體總能量或接觸安全性。
      </p>
    </div>
  );
}
