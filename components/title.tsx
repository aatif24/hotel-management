export default function Title({ children, className }: { children: React.ReactNode, className?:string }) {
  return (
    <p className={`text-2xl font-bold ${className}`}>{children}</p>
  );
}
