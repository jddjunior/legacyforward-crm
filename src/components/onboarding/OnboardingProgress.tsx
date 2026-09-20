import { Check, ClipboardList, Upload, Link2, Rocket } from 'lucide-react';
import { ONBOARDING_STEPS } from '@/lib/onboarding';

const ICONS = [ClipboardList, Upload, Link2, Rocket];

export default function OnboardingProgress({
  currentStepIndex,
  isComplete,
}: {
  currentStepIndex: number;
  isComplete: boolean;
}) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {ONBOARDING_STEPS.map((step, i) => {
        const Icon = ICONS[i];
        const done = isComplete || i < currentStepIndex;
        const current = !isComplete && i === currentStepIndex;
        return (
          <div key={step.id} className="flex items-center gap-2 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                done
                  ? 'bg-green-100 text-green-600'
                  : current
                    ? 'bg-brand text-white'
                    : 'bg-ink-surface text-ink-subtle'
              }`}
            >
              {done ? <Check size={16} /> : <Icon size={16} />}
            </div>
            <span className={`text-xs font-medium ${current ? 'text-ink' : 'text-ink-subtle'}`}>
              {step.label}
            </span>
            {i < ONBOARDING_STEPS.length - 1 && (
              <div className={`h-px flex-1 ${done ? 'bg-green-200' : 'bg-ink-line'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}
