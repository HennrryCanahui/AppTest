import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Category {
  id: string;
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  categoryId: string | null;
  completed: boolean;
}

const TASKS_KEY = '@tasks_data';
const CATEGORIES_KEY = '@categories_data';

const DEFAULT_CATEGORIES: Category[] = [
  { id: '1', name: 'General', color: '#64748b' },
  { id: '2', name: 'Trabajo', color: '#3b82f6' },
  { id: '3', name: 'Personal', color: '#ec4899' },
  { id: '4', name: 'Estudios', color: '#10b981' }
];

// ==========================================
// 1. CRUD DE CATEGORÍAS
// ==========================================

// Obtener todas las categorías (inicializando semilla si no existen)
export const getCategories = async (): Promise<Category[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(CATEGORIES_KEY);
    if (jsonValue != null) {
      return JSON.parse(jsonValue);
    } else {
      // Guardar categorías por defecto al primer uso
      await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(DEFAULT_CATEGORIES));
      return DEFAULT_CATEGORIES;
    }
  } catch (e) {
    console.error('Error al leer categorías:', e);
    return DEFAULT_CATEGORIES;
  }
};

// Agregar nueva categoría
export const addCategory = async (name: string, color: string): Promise<Category> => {
  const currentCats = await getCategories();
  const exists = currentCats.some(c => c.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    throw new Error('UNIQUE constraint failed: Ya existe una categoría con este nombre');
  }
  const newCat: Category = {
    id: Date.now().toString(),
    name: name.trim(),
    color
  };
  const updatedCats = [...currentCats, newCat];
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCats));
  return newCat;
};

// Editar categoría
export const updateCategory = async (id: string, name: string, color: string): Promise<void> => {
  const currentCats = await getCategories();
  const exists = currentCats.some(c => c.id !== id && c.name.toLowerCase() === name.trim().toLowerCase());
  if (exists) {
    throw new Error('UNIQUE constraint failed: Ya existe una categoría con este nombre');
  }
  const updatedCats = currentCats.map(c => 
    c.id === id ? { ...c, name: name.trim(), color } : c
  );
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCats));
};

// Eliminar categoría
export const deleteCategory = async (id: string): Promise<void> => {
  const currentCats = await getCategories();
  const updatedCats = currentCats.filter(c => c.id !== id);
  await AsyncStorage.setItem(CATEGORIES_KEY, JSON.stringify(updatedCats));

  // Cascading: las tareas de la categoría eliminada pasan a tener categoryId null
  const currentTasks = await getTasks();
  const updatedTasks = currentTasks.map(t => 
    t.categoryId === id ? { ...t, categoryId: null } : t
  );
  await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
};

// ==========================================
// 2. CRUD DE TAREAS
// ==========================================

// Obtener todas las tareas
export const getTasks = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(TASKS_KEY);
    return jsonValue != null ? JSON.parse(jsonValue) : [];
  } catch (e) {
    console.error('Error al leer tareas:', e);
    return [];
  }
};

// Guardar nueva tarea
export const addTask = async (title: string, categoryId: string | null): Promise<void> => {
  try {
    const currentTasks = await getTasks();
    const newTask: Task = {
      id: Date.now().toString(),
      title,
      categoryId,
      completed: false,
    };
    const updatedTasks = [newTask, ...currentTasks];
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  } catch (e) {
    console.error('Error al guardar tarea:', e);
  }
};

// Cambiar estado completado/pendiente
export const toggleTaskCompleted = async (id: string): Promise<void> => {
  try {
    const currentTasks = await getTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  } catch (e) {
    console.error('Error al actualizar tarea:', e);
  }
};

// Editar tarea (título y categoría)
export const updateTask = async (id: string, title: string, categoryId: string | null): Promise<void> => {
  try {
    const currentTasks = await getTasks();
    const updatedTasks = currentTasks.map((task) =>
      task.id === id ? { ...task, title: title.trim(), categoryId } : task
    );
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  } catch (e) {
    console.error('Error al editar tarea:', e);
  }
};

// Eliminar tarea
export const deleteTask = async (id: string): Promise<void> => {
  try {
    const currentTasks = await getTasks();
    const updatedTasks = currentTasks.filter((task) => task.id !== id);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updatedTasks));
  } catch (e) {
    console.error('Error al eliminar tarea:', e);
  }
};