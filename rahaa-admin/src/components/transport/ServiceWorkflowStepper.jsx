import React from 'react';
import { Check, ArrowRight, RotateCcw, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRegisterStepBack, triggerSingleStepBack } from '../common/StepBackButton';

export const ServiceWorkflowStepper = ({ steps, currentStep, onStepClick }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Register internal single-step undo so clicking "تراجع" anywhere steps back 1 step in the workflow first
  useRegisterStepBack(() => {
    if (currentStep > 1 && typeof onStepClick === 'function') {
      onStepClick(currentStep - 1);
      return true;
    }
    return false;
  });

  const handleStepBackOne = () => {
    if (currentStep > 1 && typeof onStepClick === 'function') {
      onStepClick(currentStep - 1);
    } else {
      triggerSingleStepBack(navigate, location);
    }
  };

  const activeStepObj = steps[currentStep - 1] || steps[0];

  return (
    <div
      className="w-full bg-rahaa-card/95 backdrop-blur-xl rounded-3xl p-4 sm:p-5 border border-rahaa-border shadow-rahaa-card font-tajawal mb-6 animate-fadeIn transition-all relative overflow-hidden"
      dir="rtl"
    >
      {/* Subtle Top Tech Accent Line (Rahah Logo Ribbon Blue & Golden Amber) */}
      <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-[#0D2D56] via-[#0B58A8] to-[#EE9224]" />

      {/* Top Bar: Step Status on Right + Single-Step Undo Button on Left */}
      <div className="flex items-center justify-between gap-3 pb-3.5 mb-4 border-b border-rahaa-border/70">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rahaa-primary/10 text-rahaa-primary border border-rahaa-primary/20 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-[#EE9224]" />
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className="font-cairo font-bold text-xs sm:text-sm text-rahaa-navy">
                مسار الحجز الذكي: {activeStepObj?.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-cairo font-bold bg-[#FEF5E8] text-[#D67E16] border border-[#EE9224]/30">
                الخطوة {currentStep} من {steps.length}
              </span>
            </div>
          </div>
        </div>

        {/* Single-Step Back / Undo Button (يتراجع خطوة واحدة) */}
        <button
          type="button"
          onClick={handleStepBackOne}
          title="تراجع خطوة واحدة للخلف"
          className="group h-9 px-3.5 rounded-xl bg-rahaa-bg hover:bg-rahaa-primary text-rahaa-navy hover:text-white border border-rahaa-border hover:border-rahaa-primary font-cairo font-bold text-xs flex items-center gap-1.5 transition-all duration-200 shadow-2xs active:scale-95 shrink-0"
        >
          <ArrowRight className="w-3.5 h-3.5 text-rahaa-primary group-hover:text-white transition-transform group-hover:translate-x-0.5" />
          <span>{currentStep > 1 ? 'تراجع خطوة سابقة' : 'تراجع للخلف'}</span>
          <RotateCcw className="w-3 h-3 opacity-70 group-hover:opacity-100" />
        </button>
      </div>

      {/* Stepper Nodes */}
      <div className="flex items-center justify-between relative px-1">
        {/* Continuous Progress Bar Behind Dots */}
        <div className="absolute top-5 right-6 left-6 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full -z-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-l from-[#0D2D56] via-[#0B58A8] to-[#EE9224] rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${(Math.max(0, currentStep - 1) / Math.max(1, steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        {/* Step Nodes */}
        {steps.map((step, idx) => {
          const stepNumber = idx + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div
              key={step.id || idx}
              onClick={() => {
                if (stepNumber !== currentStep && onStepClick) {
                  onStepClick(stepNumber);
                }
              }}
              className={`flex flex-col items-center relative z-10 group ${
                onStepClick ? 'cursor-pointer' : ''
              }`}
            >
              <div
                className={`w-9 h-9 sm:w-10 sm:h-10 rounded-2xl flex items-center justify-center font-cairo font-bold text-xs sm:text-sm transition-all duration-300 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-[#EE9224] to-[#D67E16] text-white shadow-md shadow-[#EE9224]/30 group-hover:scale-105'
                    : isCurrent
                    ? 'bg-gradient-to-br from-[#0D2D56] via-[#0B58A8] to-[#2984DF] text-white shadow-lg shadow-blue-600/35 ring-4 ring-blue-100 dark:ring-sky-900/50 scale-110'
                    : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 border-2 border-slate-200 dark:border-slate-700 group-hover:border-rahaa-primary/40'
                }`}
              >
                {isCompleted ? <Check className="w-4 h-4 stroke-[3]" /> : stepNumber}
              </div>

              <span
                className={`mt-2 font-cairo text-[10px] sm:text-xs text-center transition-colors max-w-[85px] truncate ${
                  isCurrent
                    ? 'font-black text-rahaa-primary'
                    : isCompleted
                    ? 'font-bold text-[#D67E16] dark:text-[#EE9224]'
                    : 'text-slate-400 dark:text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ServiceWorkflowStepper;
