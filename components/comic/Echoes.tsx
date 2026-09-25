/** Motion-blur trail: frame-only copies that chase a panel while it flies in. */
export function Echoes({ theme }: { theme: "blue" | "cream" | "red" | "ink" }) {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className={`echo echo--${theme}`} aria-hidden="true" />
      ))}
    </>
  );
}
