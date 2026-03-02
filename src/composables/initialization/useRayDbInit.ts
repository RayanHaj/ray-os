import { RayDb } from 'ray-db-wrapper';

export async function useRayDbInit() {
  return await RayDb.create('desktop', 1, [
    {
      name: 'files',
      keyPath: 'id',
      indexes: [
        { indexName: 'id', keyPath: 'id', unique: true },
        { indexName: 'label', keyPath: 'label', unique: true },
        { indexName: 'content', keyPath: 'content', unique: false },
      ],
      autoIncrement: true,
    },
    {
      name: 'fileSystem',
      keyPath: 'id',
      indexes: [
        { indexName: 'id', keyPath: 'id', unique: true },
        { indexName: 'parents', keyPath: 'parents', unique: false },
        { indexName: 'file', keyPath: 'file', unique: false },
        { indexName: 'directory', keyPath: 'directory', unique: true },
        { indexName: 'isSystemFile', keyPath: 'isSystemFile', unique: false },
      ],
      autoIncrement: true,
    },
    {
      name: 'desktopFiles',
      keyPath: 'id',
      indexes: [
        { indexName: 'id', keyPath: 'id', unique: true },
        { indexName: 'type', keyPath: 'type', unique: false },
        { indexName: 'tileId', keyPath: 'tileId', unique: true },
      ],
      autoIncrement: false,
    },
    {
      name: 'taskbarFiles',
      keyPath: ['id'],
      indexes: [{ indexName: 'id', keyPath: 'id', unique: false }],
      autoIncrement: false,
    },
  ]);
}
