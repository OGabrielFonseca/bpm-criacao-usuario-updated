import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { DadosAprovacaoComponent } from '../../shared/components/dados-aprovacao/dados-aprovacao.component';
import { DadosSolicitacaoComponent } from '../../shared/components/dados-solicitacao/dados-solicitacao.component';
import { DadosSolicitanteComponent } from '../../shared/components/dados-solicitante/dados-solicitante.component';
import { GruposComponent } from '../../shared/components/grupos/grupos.component';
import { SistemasComponent } from '../../shared/components/sistemas/sistemas.component';
import { VetoresComponent } from '../../shared/components/vetores/vetores.component';
import { Etapa } from '../../shared/enums/etapa.enum';
import { CommonModule } from '@angular/common';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzNotificationModule, NzNotificationService } from 'ng-zorro-antd/notification';
import { DadosInfraComponent } from '../../shared/components/dados-infra/dados-infra.component';
import { NzAlertModule } from 'ng-zorro-antd/alert';
import { ColaboradorModel } from '../../services/colaboradores/model/colaboradores.model';
import { EmpresaModel } from '../../services/empresas/model/empresas.model';
import { FilialModel } from '../../services/filiais/model/filiais.model';
import { GrupoModel } from '../../services/grupos/models/grupo.model';
import { VetorModel } from '../../shared/components/vetores/models/vetor.model';
import { WorkflowService } from '../../core/workflow/workflow.service';
import { WfProcessStep, WfFormData } from '../../core/workflow/model/workflow.model';
import { UnidadeOrganizacionalModel } from '../../services/unidades/unidade.model';

const IMPORTS = [
  CommonModule,
  NzCardModule,
  NzNotificationModule,
  NzAlertModule,
  DadosSolicitanteComponent,
  DadosSolicitacaoComponent,
  GruposComponent,
  VetoresComponent,
  SistemasComponent,
  DadosAprovacaoComponent,
  DadosInfraComponent,
];

@Component({
  selector: 'app-validacao-infra',
  standalone: true,
  imports: [...IMPORTS],
  templateUrl: './validacao-infra.component.html',
  styleUrl: './validacao-infra.component.css',
})
export class ValidacaoInfraComponent implements OnInit, AfterViewInit {
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

  @ViewChild(DadosInfraComponent, { static: false })
  dadosInfraComponent!: DadosInfraComponent;

  @ViewChild(DadosAprovacaoComponent, { static: false })
  dadosAprovacao!: DadosAprovacaoComponent;

  etapaAtual = Etapa.VALIDACAO_INFRA;

  possuiGruposSapiens = true;
  possuiGruposHcm = true;

  variaveisProcesso!: Record<string, unknown>;

  possuiLog = false;
  log = '';

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

    //carregando os dados de infra
    this.log = (await this.variaveisProcesso['logInfraestrutura']) as string;
    if (this.log) this.possuiLog = true;
    const realizouTreinamento = this.variaveisProcesso['realizouTreinamento'] === 'true';
    this.dadosInfraComponent.formGroup.controls.realizouTreinamento.setValue(realizouTreinamento);
    const criarAtualizarAD = this.variaveisProcesso['criarAtualizarAD'] === 'true';
    this.dadosInfraComponent.formGroup.controls.criarAtualizarAD.setValue(criarAtualizarAD);
    const loginUsuario = this.variaveisProcesso['loginUsuario'] as string;
    this.dadosInfraComponent.formGroup.controls.loginUsuario.setValue(loginUsuario);

    const unidade = (this.variaveisProcesso['unidadeOrganizacional'] as string)
      ? ((await JSON.parse(this.variaveisProcesso['unidadeOrganizacional'] as string)) as UnidadeOrganizacionalModel)
      : null;
    if (unidade) this.dadosInfraComponent.listaUnidades = [unidade];

    this.dadosInfraComponent.formGroup.controls.unidadeOrganizacional.setValue(unidade);
  }

  async enviaEtapa(processStep: WfProcessStep): Promise<WfFormData> {
    const acaoEscolhida = processStep.nextAction.name;

    if (['Solicitar Revisão', 'Reprovar'].includes(acaoEscolhida)) {
      this.dadosAprovacao.setNecessitaJustificativa(true);

      if (!this.dadosAprovacao.estaValido()) {
        this.notificationService.error('Erro', 'Dados de Justificativa Inválidos!');
        this.workflowService.abortSubmit();
      }

      const usuario = `${this.workflowService.getUser().fullname} (${this.workflowService.getUser().username}) - T.I. INFRA`;
      const dadosEtapa = {
        justificativaRevisao: this.dadosAprovacao.formGroup.controls.justificativaRevisao.value,
        quemSolicitouRevisao: usuario || '',
      };

      return { formData: dadosEtapa };
    }

    this.dadosAprovacao.setNecessitaJustificativa(false);
    if (!this.dadosInfraComponent.estaValido()) {
      this.notificationService.error('Erro', 'Dados de Infraestrutura Inválidos!');
      this.workflowService.abortSubmit();
    }

    const dadosEtapa = {
      logInfraestrutura: null,
      usuarioCriado: false,
      realizouTreinamento: this.dadosInfraComponent.formGroup.controls.realizouTreinamento.value,
      criarAtualizarAD: this.dadosInfraComponent.formGroup.controls.criarAtualizarAD.value,
      loginUsuario: this.dadosInfraComponent.formGroup.controls.loginUsuario.value,
      unidadeOrganizacional: JSON.stringify(this.dadosInfraComponent.formGroup.controls.unidadeOrganizacional.value),
    };

    return { formData: dadosEtapa };
  }
}
