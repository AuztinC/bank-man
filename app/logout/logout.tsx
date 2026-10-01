import signOut from "@/app/logout/actions";

export default function Logout() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="inline-flex min-h-12 w-full items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-accent/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sidebar"
      >
        Logout
      </button>
    </form>
  );
}
