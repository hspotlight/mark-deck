import Button from "@mui/material/Button";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-bold text-gray-900">mark-deck</h1>
      <p className="text-lg text-gray-600">Write, preview, and publish Marp slides.</p>
      <Button variant="contained" className="mt-4">
        Get Started
      </Button>
    </main>
  );
}
