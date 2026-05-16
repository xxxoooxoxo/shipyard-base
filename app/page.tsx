import Image from "next/image";

export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="flex w-full max-w-xl flex-col items-center text-center">
        <Image
          src="/logo-porthole.png"
          alt="Nautilus"
          width={72}
          height={72}
          priority
          className="size-16 rounded-full"
        />

        <h1 className="mt-6 max-w-[20ch] text-4xl font-semibold tracking-tight text-foreground text-balance sm:text-5xl">
          Welcome to your next website.
        </h1>

        <p className="mt-5 max-w-[52ch] text-base text-muted-foreground text-pretty sm:text-lg">
          This is the starting point for something new. Take your time, look
          around, and when you&apos;re ready, we will help you bring your ideas
          to life.
        </p>
      </div>
    </main>
  );
}
