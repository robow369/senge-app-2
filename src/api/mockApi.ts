import { FormData } from '../types/form';

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: { id: string; updatedAt: string };
}

export async function updateUser(formData: FormData): Promise<ApiResponse> {
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const shouldFail = false;

  if (shouldFail) {
    throw new Error('Falha ao conectar com o servidor. Tente novamente.');
  }

  console.log('Mock API call - PUT /api/users/update', JSON.stringify(formData, null, 2));

  return {
    success: true,
    message: 'Cadastro atualizado com sucesso!',
    data: {
      id: crypto.randomUUID(),
      updatedAt: new Date().toISOString(),
    },
  };
}
