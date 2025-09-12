export const categoryColors = ['Red', 'Orange', 'Yellow', 'Green', 'Blue'] as const;
export type CategoryColor = typeof categoryColors[number];

export const todoCardStatuses = ['done', 'active', 'inactive'] as const;
export type TodoCardStatus = typeof todoCardStatuses[number];

export type Category = {
  id: number,
  label: string,
  color: CategoryColor
}

export type Card = {
  title: string,
  status: TodoCardStatus,
  linkedItemId?: number
  categoryId?: number
  subTasks?: SubTask[]
}

export type SubTask = {
  title: string,
  completed: boolean
}
