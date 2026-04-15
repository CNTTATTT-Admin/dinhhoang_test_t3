export default function CompanyPolicy({ rules = [], sections = [] }) {
  const normalizedRules = Array.isArray(rules) ? rules.filter(Boolean) : []
  const normalizedSections = Array.isArray(sections) ? sections.filter(Boolean) : []

  return (
    <section className="h-full min-h-0 overflow-hidden rounded-lg border border-slate-300 bg-[#f4f5f7] font-['Segoe_UI','Inter',sans-serif] text-slate-800">
      <div className="window-header flex items-center justify-between border-b border-slate-300 bg-slate-100 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">Google Docs</p>
        <p className="text-[11px] text-slate-500">Internal Policy</p>
      </div>
      <div className="scrollable-content h-full overflow-y-auto bg-[#eceff3] p-3">
        <article className="mx-auto min-h-[420px] w-full max-w-[520px] rounded-sm border border-slate-200 bg-white px-7 py-6 shadow-sm">
          <h2 className="text-center text-[22px] font-extrabold leading-[1.35] text-slate-900">
            NOI QUY AN TOAN THONG TIN NOI BO
          </h2>
          <p className="mt-2 text-center text-xs leading-relaxed text-slate-500">
            Tai lieu tham chieu trong bai tap MAIL + ZALO + DOC
          </p>

          {normalizedSections.length > 0 ? (
            <div className="mt-5 space-y-4">
              {normalizedSections.map((section, idx) => (
                <section
                  key={`${idx}-${section?.employee || 'policy'}`}
                  className="mb-3 rounded-md border border-slate-200 bg-slate-50/60 p-3"
                >
                  <p className="text-[16px] font-bold text-slate-900">{section?.employee || 'Nhan su noi bo'}</p>
                  {section?.email ? (
                    <p className="mt-0.5 text-[13px] italic text-slate-600">{section.email}</p>
                  ) : null}
                  <ul className="mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-slate-800">
                    {(Array.isArray(section?.rules) ? section.rules : []).map((rule, ruleIdx) => (
                      <li key={`${idx}-${ruleIdx}-${rule}`}>{rule}</li>
                    ))}
                  </ul>
                </section>
              ))}
            </div>
          ) : (
            <ol className="mt-5 list-decimal space-y-2 pl-5 text-[13px] leading-relaxed text-slate-800">
              {normalizedRules.length > 0 ? (
                normalizedRules.map((rule, idx) => <li key={`${idx}-${rule}`}>{rule}</li>)
              ) : (
                <li>Chua co noi quy duoc tai len.</li>
              )}
            </ol>
          )}
        </article>
      </div>
    </section>
  )
}
