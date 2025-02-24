import { Pipe, PipeTransform } from '@angular/core';
import { GrupoModel } from '../services/grupos/models/grupo.model';

@Pipe({
  name: 'descricaoGrupo',
  standalone: true,
})
export class DescricaoGrupoPipe implements PipeTransform {
  transform(grupo: GrupoModel): string {
    return (
      (grupo.nomcat ? grupo.nomcat : '') +
      (grupo.nomgrp && grupo.nomcat ? ' - ' : '') +
      (grupo.nomgrp ? grupo.nomgrp : '') +
      ((grupo.nomgrp && grupo.obsgrp) || (grupo.nomcat && grupo.obsgrp) ? ' - ' : '') +
      (grupo.obsgrp ? grupo.obsgrp : '')
    );
  }
}
