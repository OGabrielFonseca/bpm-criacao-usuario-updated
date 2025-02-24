export class FiliaisModel {
  filiais!: FilialModel[];
}
export class FilialModel {
  constructor(codfil?: string, nomfil?: string, codemp?: string, nomemp?: string) {
    if (codfil) this.codfil = codfil;
    if (nomfil) this.nomfil = nomfil;
    if (codemp) this.codemp = codemp;
    if (nomemp) this.nomemp = nomemp;
  }

  codfil!: string;
  nomfil!: string;
  codemp!: string;
  nomemp!: string;
}
