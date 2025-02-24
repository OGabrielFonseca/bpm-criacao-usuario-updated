import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { ColaboradorModel } from '../../services/colaboradores/model/colaboradores.model';
import { EmpresaModel } from '../../services/empresas/model/empresas.model';
import { FilialModel } from '../../services/filiais/model/filiais.model';
import { GrupoModel } from '../../services/grupos/models/grupo.model';
import { DadosAprovacaoComponent } from '../../shared/components/dados-aprovacao/dados-aprovacao.component';
import { DadosSolicitacaoComponent } from '../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '../../shared/components/dados-solicitante/dados-solicitante.component';
import { GruposComponent } from '../../shared/components/grupos/grupos.component';
import { SistemasComponent } from '../../shared/components/sistemas/sistemas.component';
import { VetorModel } from '../../shared/components/vetores/models/vetor.model';
import { VetoresComponent } from '../../shared/components/vetores/vetores.component';
import { Etapa } from '../../shared/enums/etapa.enum';

const IMPORTS = [
  CommonModule,
  NzCardModule,
  NzNotificationModule,
  DadosSolicitanteComponent,
  DadosSolicitacaoComponent,
  GruposComponent,
  VetoresComponent,
  SistemasComponent,
  DadosAprovacaoComponent,
];

@Component({
  selector: 'app-detalhes',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './detalhes.component.html',
  styleUrl: './detalhes.component.css',
})
export class DetalhesComponent implements AfterViewInit {
  @ViewChild(DadosSolicitanteComponent, { static: false })
  solicitanteComponent!: DadosSolicitanteComponent;

  @ViewChild(DadosSolicitacaoComponent, { static: false })
  solicitacaoComponent!: DadosSolicitacaoComponent;

  @ViewChild('gruposSapiens', { static: false })
  gruposSapiensComponent!: GruposComponent;

  @ViewChild('gruposHcm', { static: false })
  gruposHcmComponent!: GruposComponent;

  @ViewChild(VetoresComponent, { static: false })
  vetoresComponent!: VetoresComponent;

  @ViewChild(SistemasComponent, { static: false })
  sistemasComponent!: SistemasComponent;

  @ViewChild(DadosAprovacaoComponent, { static: false })
  dadosAprovacao!: DadosAprovacaoComponent;

  etapaAtual = Etapa.DETALHES;

  possuiGruposSapiens = true;
  possuiGruposHcm = true;

  variaveisProcesso!: Record<string, unknown>;

  constructor(
    private workflowService: WorkflowService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.workflowService.requestProcessVariables().then(retorno => {
      this.variaveisProcesso = retorno;
    });

    //carregando os dados do solicitante
    this.solicitanteComponent.formGroup.patchValue(this.variaveisProcesso);

    //carregando dados solicitacao
    this.solicitacaoComponent.formGroup.patchValue(this.variaveisProcesso);
    const colaborador = (await JSON.parse(this.variaveisProcesso['colaborador'] as string)) as ColaboradorModel;
    this.solicitacaoComponent.preencherColaborador(colaborador);

    //carregando dados grupos Sapiens
    const gruposSapiensString = this.variaveisProcesso['gruposSapiens'] as string;
    const gruposSapiens = gruposSapiensString ? (JSON.parse(gruposSapiensString) as GrupoModel[]) : [];
    this.possuiGruposSapiens = !!gruposSapiens.length;
    if (this.possuiGruposSapiens) this.gruposSapiensComponent.preencherGrupos(gruposSapiens);

    //carregando dados grupos Hcm
    const gruposHcmString = this.variaveisProcesso['gruposHcm'] as string;
    const gruposHcm = gruposHcmString ? (JSON.parse(gruposHcmString) as GrupoModel[]) : [];
    this.possuiGruposHcm = !!gruposHcm.length;
    if (this.possuiGruposHcm) this.gruposHcmComponent.preencherGrupos(gruposHcm);

    //careregando dados vetores
    if (this.possuiGruposSapiens || this.possuiGruposHcm) {
      const filiais = (await JSON.parse(this.variaveisProcesso['filialVetor'] as string)) as FilialModel[];
      const vetores = filiais.map((filial: FilialModel) => {
        const empresa = new EmpresaModel(filial.codemp, filial.nomemp);
        return new VetorModel(filial, empresa);
      });

      this.vetoresComponent.preencherVetores(vetores);
    }

    //carregando dados sistemas
    this.sistemasComponent.preencherDadosSistemas(this.variaveisProcesso);

    //carregando dados de aprovacao
    this.dadosAprovacao.formGroup.patchValue(this.variaveisProcesso);
  }
}
