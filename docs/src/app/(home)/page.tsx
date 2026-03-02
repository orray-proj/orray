import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
      <h1 className="mb-4 font-bold text-5xl tracking-tight">Orray</h1>
      <p className="mb-2 text-fd-muted-foreground text-lg">
        A spatial interface for distributed systems.
      </p>
      <p className="mb-8 max-w-lg text-fd-muted-foreground text-sm">
        Navigate your Kubernetes platform as a canvas — zoom into services,
        trace requests visually, diff environments, and operate infrastructure
        directly.
      </p>
      <Link
        className="inline-flex items-center rounded-full bg-fd-primary px-6 py-2.5 font-medium text-fd-primary-foreground text-sm transition-colors hover:bg-fd-primary/90"
        href="/docs"
      >
        Read the docs
      </Link>
    </div>
  );
}
