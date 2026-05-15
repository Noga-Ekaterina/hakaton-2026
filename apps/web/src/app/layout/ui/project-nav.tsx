import { NavLink, useLocation } from "react-router-dom";
import { paths, projectDonePath, projectPath } from "@/shared/config/routes";
import { SegmentedControl, segmentedControlItemClass } from "@/shared/ui/segmented-control";

interface ProjectNavProps {
  currentProjectId: number | null;
}

export function ProjectNav({ currentProjectId }: ProjectNavProps) {
  const location = useLocation();
  const routeWithSearch = (pathname: string) => ({ pathname, search: location.search });

  return (
    <div className="flex flex-col gap-3 lg:items-end">
      <nav className="flex flex-wrap gap-3 items-baseline">
        <SegmentedControl>
          <NavLink
            to={currentProjectId ? routeWithSearch(projectPath(currentProjectId)) : routeWithSearch(paths.home)}
            end={Boolean(currentProjectId)}
            className={({ isActive }) => segmentedControlItemClass(isActive)}
          >
            Доска
          </NavLink>
          {currentProjectId ? (
            <NavLink
              to={routeWithSearch(projectDonePath(currentProjectId))}
              className={({ isActive }) => segmentedControlItemClass(isActive)}
            >
              Сделаны
            </NavLink>
          ) : null}
        </SegmentedControl>

      </nav>
    </div>
  );
}
