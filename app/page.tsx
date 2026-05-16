import Image from "next/image";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const starterPrompts = [
  "Launch a membership sales page",
  "Build a wash package selector",
  "Create a customer portal",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6fafb] text-[#062c3d]">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-8 sm:px-10 lg:px-12">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-porthole.png"
              alt="Nautilus"
              width={44}
              height={44}
              priority
              className="size-11 rounded-full"
            />
            <div>
              <p className="text-sm font-semibold tracking-[0.18em] text-[#0e7895] uppercase">
                Nautilus
              </p>
              <p className="text-sm text-[#5d7580]">Builder Base</p>
            </div>
          </div>
          <Button
            render={<a href="https://nautilus.co" />}
            variant="outline"
            nativeButton={false}
          >
            Nautilus.co
          </Button>
        </header>

        <div className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="max-w-2xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#b7dce5] bg-white px-3 py-1 text-sm font-medium text-[#0b6c84]">
              <Sparkles className="size-4" />
              Ready for car wash growth tools
            </div>
            <h1 className="text-5xl font-semibold tracking-tight text-[#053548] sm:text-6xl">
              Start with a polished Nautilus foundation.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#526c77]">
              This base app is ready for focused product work: clean layout,
              shadcn/ui components, Tailwind styling, and a Nautilus-branded
              first screen instead of the default framework starter.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button
                render={<a href="https://nautilus.co" />}
                size="lg"
                className="bg-[#063a52]"
                nativeButton={false}
              >
                Explore Nautilus
                <ArrowRight className="size-4" />
              </Button>
              <Button
                render={
                  <a
                    href="https://ui.shadcn.com/docs/components"
                    target="_blank"
                    rel="noreferrer"
                  />
                }
                variant="outline"
                size="lg"
                nativeButton={false}
              >
                Component docs
              </Button>
            </div>
          </div>

          <div className="rounded-3xl border border-[#d7e8ed] bg-white p-4 shadow-[0_24px_80px_rgba(5,53,72,0.12)]">
            <div className="rounded-2xl border border-[#e4eef2] bg-[#fbfdfe] p-5">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-[#66808a]">
                    Workspace
                  </p>
                  <h2 className="text-xl font-semibold">Project starter</h2>
                </div>
                <div className="h-3 w-3 rounded-full bg-[#15b8a6]" />
              </div>
              <div className="space-y-3">
                {starterPrompts.map((prompt) => (
                  <div
                    key={prompt}
                    className="flex items-center justify-between rounded-xl border border-[#dbe8ec] bg-white px-4 py-3 text-sm font-medium"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="size-4 text-[#0e7895]" />
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl bg-[#063a52] p-5 text-white">
                <p className="text-sm text-[#a9d5de]">Included</p>
                <p className="mt-2 text-2xl font-semibold">
                  Next.js + shadcn/ui
                </p>
                <p className="mt-2 text-sm leading-6 text-[#cce4ea]">
                  A practical starting point for dashboards, portals, forms,
                  and customer-facing workflows.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
