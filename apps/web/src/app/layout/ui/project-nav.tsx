import { NavLink, useLocation } from "react-router-dom";
import { paths, projectDonePath, projectPath } from "@/shared/config/routes";
import { Button } from "@/shared/ui/button";

const linkBaseClass =
  "rounded-full px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40";

interface ProjectNavProps {
  currentProjectId: number | null;
  onCreateTask: () => void;
}

export function ProjectNav({ currentProjectId, onCreateTask }: ProjectNavProps) {
  const location = useLocation();
  const routeWithSearch = (pathname: string) => ({ pathname, search: location.search });

  return (
    <div className="flex flex-col gap-3 pb-[0.4rem] lg:items-end">
      <nav className="flex flex-wrap gap-3">
        <NavLink
          to={currentProjectId ? routeWithSearch(projectPath(currentProjectId)) : routeWithSearch(paths.home)}
          end={Boolean(currentProjectId)}
          className={({ isActive }) =>
            `${linkBaseClass} ${
              isActive ? "bg-slate-900 text-white shadow-lg shadow-slate-900/20" : "bg-white/70 text-slate-700 hover:bg-white"
            }`
          }
        >
          Доска
        </NavLink>
        {currentProjectId ? (
          <NavLink
            to={routeWithSearch(projectDonePath(currentProjectId))}
            className={({ isActive }) =>
              `${linkBaseClass} ${
                isActive ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" : "bg-white/70 text-slate-700 hover:bg-white"
              }`
            }
          >
            Сделаны
          </NavLink>
        ) : null}

        <Button type="button" onClick={onCreateTask}>
          Создать задачу
        </Button>
      </nav>
    </div>
  );
}
