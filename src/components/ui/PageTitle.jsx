export function PageTitle({ children, kicker, tone }) {
  return (
    <div className="mb-7">
      {kicker && (
        <div className="font-cond text-grass-400 font-semibold tracking-[.22em] uppercase text-xs mb-2">{kicker}</div>
      )}
      <h1 className={`title-3d ${tone || ""} text-4xl sm:text-5xl leading-[1.05]`}>{children}</h1>
    </div>
  );
}
