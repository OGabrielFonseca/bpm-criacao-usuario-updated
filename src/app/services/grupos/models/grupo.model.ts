export interface GruposModel {
  grupos: GrupoModel[];
}

export interface GrupoModel {
  codgrp: number;
  nomgrp: string;
  codcat: number;
  nomcat: string;
  codapr: number;
  nomapr: string;
  obsgrp: string;
}
