export interface RecursiveRelationEntity<T> {
  id: number;
  parent?: T;
  children: T[];
}

export const nestChildrenEntitiesUtil = <T extends RecursiveRelationEntity<T>>(
  entities: T[],
): T[] => {
  /**
   * Result of format, with children entities nested inside parent entities
   */
  const result: T[] = [];
  /**
   * A dictionary to store query result, with key as the id of the entity
   */
  const inMemoryStorage: { [id: number]: T } = {};

    // Store all entities in the dictionary
  entities.forEach((entity: T) => {
    entity.children = [];
    inMemoryStorage[entity.id] = entity;

    // Push all root entities into result
    if (!entity.parent) {
      result.push(entity);
    }
  });

  // Push all children entities into their parent's children array
  entities.forEach((entity: T) => {
    if (entity.parent) {
      inMemoryStorage[entity.parent.id].children.push(entity);
    }
  });

  return result;
};
