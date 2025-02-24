export interface RetornoPlugin<T> {
  outputData: T & {
    responseCode: number;
    erroExecucao: string;
  };
}
