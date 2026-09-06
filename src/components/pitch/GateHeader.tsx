import { GATE_STEPS, GATE_ORDER, type GateStage } from './gateData';

// Gateway header bar — LF mark, brand, review label, and the four gate step pills.
export default function GateHeader({ stage, stagedLabel }: { stage: GateStage; stagedLabel: string }) {
  const idx = GATE_ORDER.indexOf(stage);
  return (
    <div className="h-[46px] flex-none flex items-center gap-3 px-3.5 border-b border-[#e9e6de] bg-[#f7f6f2]">
      <span className="w-[18px] h-[18px] rounded-[5px] bg-[#111116] text-[#ffc400] flex items-center justify-center text-[11.5px] font-bold">
        LF
      </span>
      <span className="text-[12.5px] font-semibold">Legacy Forward</span>
      <span className="text-[12.5px] text-[#5f5f66]">Website review · staged {stagedLabel}</span>
      <div className="flex-1" />
      {GATE_STEPS.map((label, i) => (
        <span
          key={label}
          className={`text-[11px] whitespace-nowrap rounded-full px-[9px] py-1 ${
            i === idx
              ? 'font-semibold bg-[#111116] text-[#ffc400]'
              : i < idx
                ? 'font-medium text-[#1f6b18]'
                : 'font-medium text-[#5f5f66]'
          }`}
        >
          0{i + 1} {label}
        </span>
      ))}
    </div>
  );
}
