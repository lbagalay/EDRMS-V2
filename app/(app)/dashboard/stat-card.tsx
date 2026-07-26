export function StatCard({
  label,
  value,
  color,
  featured = false,
}: {
  label: string;
  value: number;
  color: "green" | "red" | "blue";
  featured?: boolean;
}) {
  const colorMap = {
    green: "text-[#6ED178] border-[#6ED178]",
    red: "text-red-500 border-red-500",
    blue: "text-[#189AB4] border-[#189AB4]",
  };

  if (featured) {
    return (
      <div
        className="relative overflow-hidden rounded-lg p-4"
        style={{
          backgroundImage: "url('/brand/cardbg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <p className="text-sm text-white/90">{label}</p>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg border-l-4 bg-[#F0F0F0] p-4 ${colorMap[color]}`}>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  );
}