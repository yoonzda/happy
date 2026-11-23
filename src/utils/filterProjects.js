export function filterProjects(projects = [], selectedFilters = {}) {
  const activeEntries = Object.entries(selectedFilters).filter(
    ([, values]) => Array.isArray(values) && values.length > 0
  );

  if (activeEntries.length === 0) {
    return projects;
  }

  return projects.filter((project) => {
    const projectFilters =
      project && typeof project.filters === 'object' && project.filters !== null
        ? project.filters
        : {};

    return activeEntries.every(([groupId, selectedValues]) => {
      const assigned = Array.isArray(projectFilters[groupId])
        ? projectFilters[groupId]
        : [];
      return selectedValues.some((val) => assigned.includes(val));
    });
  });
}

export function countActiveFilters(selectedFilters = {}) {
  return Object.values(selectedFilters).reduce(
    (sum, values) => sum + (Array.isArray(values) ? values.length : 0),
    0
  );
}
