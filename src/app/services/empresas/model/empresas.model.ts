export class EmpresasModel {
  empresas!: EmpresaModel[];
}

export class EmpresaModel {
  constructor(codemp: string, nomemp: string) {
    this.codemp = codemp;
    this.nomemp = nomemp;
  }

  codemp!: string;
  nomemp!: string;
}
