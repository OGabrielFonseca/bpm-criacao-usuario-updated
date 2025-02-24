import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { DadosAprovacaoComponent } from '../../shared/components/dados-aprovacao/dados-aprovacao.component';
import { DadosSolicitacaoComponent } from '../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '../../shared/components/dados-solicitante/dados-solicitante.component';
import { GruposComponent } from '../../shared/components/grupos/grupos.component';
import { SistemasComponent } from '../../shared/components/sistemas/sistemas.component';
import { VetoresComponent } from '../../shared/components/vetores/vetores.component';
import { WfProcessStep, WfFormData } from '../../core/workflow/model/workflow.model';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { ColaboradorModel } from '../../services/colaboradores/model/colaboradores.model';
import { GrupoModel } from '../../services/grupos/models/grupo.model';
import { VetorModel } from '../../shared/components/vetores/models/vetor.model';
import { Etapa } from '../../shared/enums/etapa.enum';
import { FilialModel } from '../../services/filiais/model/filiais.model';
import { EmpresaModel } from '../../services/empresas/model/empresas.model';

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
  selector: 'app-aprovacao-gestor',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './aprovacao-gestor.component.html',
  styleUrl: './aprovacao-gestor.component.css',
})
export class AprovacaoGestorComponent implements OnInit, AfterViewInit {
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

  etapaAtual = Etapa.APROVACAO;

  possuiGruposSapiens = true;
  possuiGruposHcm = true;

  variaveisProcesso!: Record<string, unknown>;

  constructor(
    private workflowService: WorkflowService,
    private notificationService: NzNotificationService,
  ) {}

  ngOnInit(): void {
    this.workflowService.onSubmit(this.enviaEtapa.bind(this));
  }

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
  }

  async enviaEtapa(processStep: WfProcessStep): Promise<WfFormData> {
    const acaoEscolhida = processStep.nextAction.name;
    let usuario = '';

    if (['Solicitar Revisão', 'Reprovar'].includes(acaoEscolhida)) {
      this.dadosAprovacao.setNecessitaJustificativa(true);
      usuario = `${this.workflowService.getUser().fullname} (${this.workflowService.getUser().username}) - GESTOR`;
    } else {
      this.dadosAprovacao.setNecessitaJustificativa(false);
    }

    if (!this.dadosAprovacao.estaValido()) {
      this.notificationService.error('Erro', 'Informe a Justificativa');
      this.workflowService.abortSubmit();
    }

    const dadosEtapa = {
      justificativaRevisao: this.dadosAprovacao.formGroup.controls.justificativaRevisao.value,
      quemSolicitouRevisao: usuario || '',
    };

    return { formData: dadosEtapa };
  }
}
