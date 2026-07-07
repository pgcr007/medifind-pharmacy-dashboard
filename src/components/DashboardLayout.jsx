import { NavLink, Outlet, Navigate } from "react-router-dom";
import { Store, Package, ClipboardList, Star, LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import logoIcon from "../assets/logo-icon.png";

const navItems = [
  { to: "/", label: "Pharmacy", icon: Store, end: true, alwaysEnabled: true },
  { to: "/inventory", label: "Inventory", icon: Package },
  { to: "/reservations", label: "Reservations", icon: ClipboardList },
  { to: "/reviews", label: "Reviews", icon: Star },
];

export default function DashboardLayout() {
  const { user, pharmacy, pharmacyLoading, logout } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  // Inventory/Reservations/Reviews all require an existing pharmacy._id --
  // keep them disabled until the one-time pharmacy setup form is completed,
  // so a brand-new pharmacy owner can't land on a broken/empty page.
  const hasPharmacy = Boolean(pharmacy);

  return (
    <div className="min-h-screen bg-paper flex">
      <aside className="w-60 shrink-0 border-r border-hairline flex flex-col">
        <div className="px-6 py-6 border-b border-hairline">
          <div className="flex items-center gap-2.5">
            <img src={logoIcon} alt="MediFind AI" className="h-8 w-8" />
            <div className="font-display text-lg text-ink">MediFind AI</div>
          </div>
          <div className="text-xs text-ink-soft font-mono mt-1.5">
            Pharmacy Dashboard
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon, end, alwaysEnabled }) => {
            const enabled = alwaysEnabled || hasPharmacy || pharmacyLoading;

            if (!enabled) {
              return (
                <div
                  key={to}
                  title="Set up your pharmacy first"
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium text-ink-soft/40 cursor-not-allowed select-none"
                >
                  <Icon size={17} strokeWidth={2} />
                  {label}
                </div>
              );
            }

            return (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2.5 rounded text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-bottle text-paper"
                      : "text-ink-soft hover:bg-paper-dim hover:text-ink"
                  }`
                }
              >
                <Icon size={17} strokeWidth={2} />
                {label}
              </NavLink>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-hairline">
          <div className="px-3 pb-3">
            <div className="text-sm font-medium text-ink truncate">
              {pharmacyLoading ? "Loading…" : pharmacy?.name || user.name}
            </div>
            <div className="text-xs text-ink-soft truncate">{user.email}</div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm text-ink-soft hover:bg-paper-dim hover:text-rust transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0">
        <Outlet />
      </main>
    </div>
  );
}