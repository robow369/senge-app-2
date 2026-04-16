import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

interface Dependent {
  nome: string;
  parentesco: string;
  nascimento: string;
  cpf: string;
}

interface FormData {
  nome: string;
  nomeMae: string;
  dataNascimento: string;
  estadoCivil: string;
  nacionalidade: string;
  naturalidade: string;
  cpf: string;
  rg: string;
  residencia: string;
  bairro: string;
  cep: string;
  cidade: string;
  estado: string;
  telefonesContato: string;
  celularWhatsapp: string;
  email: string;
  cursoGraduacao: string;
  outrasTitulacoes: string;
  instituicao: string;
  anoColacaoGrau: string;
  carteiraConfeaRnp: string;
  dataEmissao: string;
  empresaOndeTrabalha: string;
  dataAdmissao: string;
  cargo: string;
  telefoneEmpresa: string;
  enderecoEmpresa: string;
  dependentes: Dependent[];
}

const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 40;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const LINE_HEIGHT = 14;
const SECTION_GAP = 10;
const FIELD_GAP = 4;

const DARK_BLUE = rgb(0.102, 0.137, 0.494);
const LIGHT_BLUE = rgb(0.239, 0.737, 0.906);
const BLACK = rgb(0, 0, 0);
const GRAY = rgb(0.4, 0.4, 0.4);
const LIGHT_GRAY = rgb(0.9, 0.9, 0.9);

export async function buildRegistrationPdf(formData: FormData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regularFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  let page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let y = PAGE_HEIGHT - MARGIN;

  function ensureSpace(needed: number) {
    if (y - needed < MARGIN + 40) {
      page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      y = PAGE_HEIGHT - MARGIN;
    }
  }

  function drawHeader() {
    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 70,
      width: PAGE_WIDTH,
      height: 70,
      color: DARK_BLUE,
    });
    page.drawText("SENGE-CE", {
      x: MARGIN,
      y: PAGE_HEIGHT - 30,
      size: 18,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    page.drawText("Sindicato dos Engenheiros no Estado do Ceará", {
      x: MARGIN,
      y: PAGE_HEIGHT - 48,
      size: 9,
      font: regularFont,
      color: rgb(1, 1, 1),
    });
    page.drawText("Rua Alegre, 01 - Praia de Iracema, CEP: 60.060-280 – Fortaleza-CE", {
      x: MARGIN,
      y: PAGE_HEIGHT - 60,
      size: 8,
      font: regularFont,
      color: rgb(0.8, 0.8, 0.8),
    });

    page.drawRectangle({
      x: 0,
      y: PAGE_HEIGHT - 90,
      width: PAGE_WIDTH,
      height: 20,
      color: LIGHT_BLUE,
    });
    page.drawText("ATUALIZAÇÃO CADASTRAL", {
      x: PAGE_WIDTH / 2 - 60,
      y: PAGE_HEIGHT - 84,
      size: 10,
      font: boldFont,
      color: rgb(1, 1, 1),
    });

    y = PAGE_HEIGHT - MARGIN - 60;
  }

  function drawSectionHeader(title: string) {
    ensureSpace(22 + SECTION_GAP);
    y -= SECTION_GAP;
    page.drawRectangle({
      x: MARGIN,
      y: y - 14,
      width: CONTENT_WIDTH,
      height: 18,
      color: LIGHT_BLUE,
    });
    page.drawText(title.toUpperCase(), {
      x: MARGIN + 6,
      y: y - 10,
      size: 8,
      font: boldFont,
      color: rgb(1, 1, 1),
    });
    y -= 22;
  }

  function drawField(label: string, value: string, x: number, width: number) {
    ensureSpace(LINE_HEIGHT * 2 + FIELD_GAP * 2);
    page.drawText(label.toUpperCase(), {
      x,
      y,
      size: 6.5,
      font: boldFont,
      color: GRAY,
    });
    y -= LINE_HEIGHT - 2;
    page.drawLine({
      start: { x, y },
      end: { x: x + width, y },
      thickness: 0.5,
      color: LIGHT_GRAY,
    });
    page.drawText(value || "—", {
      x,
      y: y - 10,
      size: 9,
      font: regularFont,
      color: BLACK,
    });
    y -= LINE_HEIGHT + FIELD_GAP + 2;
  }

  function drawRow(fields: Array<{ label: string; value: string; widthPct: number }>) {
    const totalFields = fields.length;
    const gap = 10;
    const totalGaps = gap * (totalFields - 1);
    const availableWidth = CONTENT_WIDTH - totalGaps;

    const startY = y;
    let maxDrop = 0;

    let xOffset = MARGIN;
    for (const f of fields) {
      const w = availableWidth * f.widthPct;
      const beforeY = y;
      y = startY;
      drawField(f.label, f.value, xOffset, w);
      const drop = startY - y;
      if (drop > maxDrop) maxDrop = drop;
      xOffset += w + gap;
    }
    y = startY - maxDrop;
  }

  drawHeader();

  drawSectionHeader("Dados Pessoais");
  drawRow([{ label: "Nome", value: formData.nome, widthPct: 1 }]);
  drawRow([{ label: "Nome da Mãe", value: formData.nomeMae, widthPct: 1 }]);
  drawRow([
    { label: "Data de Nascimento", value: formData.dataNascimento, widthPct: 0.33 },
    { label: "Estado Civil", value: formData.estadoCivil, widthPct: 0.33 },
    { label: "Nacionalidade", value: formData.nacionalidade, widthPct: 0.34 },
  ]);
  drawRow([
    { label: "Naturalidade", value: formData.naturalidade, widthPct: 0.5 },
    { label: "CPF", value: formData.cpf, widthPct: 0.25 },
    { label: "RG", value: formData.rg, widthPct: 0.25 },
  ]);

  drawSectionHeader("Endereço");
  drawRow([{ label: "Residência", value: formData.residencia, widthPct: 1 }]);
  drawRow([
    { label: "Bairro", value: formData.bairro, widthPct: 0.3 },
    { label: "CEP", value: formData.cep, widthPct: 0.2 },
    { label: "Cidade", value: formData.cidade, widthPct: 0.3 },
    { label: "Estado", value: formData.estado, widthPct: 0.2 },
  ]);
  drawRow([
    { label: "Telefones de Contato", value: formData.telefonesContato, widthPct: 0.4 },
    { label: "Celular (WhatsApp)", value: formData.celularWhatsapp, widthPct: 0.3 },
    { label: "E-mail", value: formData.email, widthPct: 0.3 },
  ]);

  drawSectionHeader("Dados Profissionais");
  drawRow([{ label: "Curso de Graduação", value: formData.cursoGraduacao, widthPct: 1 }]);
  drawRow([
    { label: "Outras Titulações", value: formData.outrasTitulacoes, widthPct: 0.6 },
    { label: "Ano de Colação de Grau", value: formData.anoColacaoGrau, widthPct: 0.4 },
  ]);
  drawRow([
    { label: "Instituição", value: formData.instituicao, widthPct: 0.6 },
    { label: "Carteira Confea-RNP", value: formData.carteiraConfeaRnp, widthPct: 0.4 },
  ]);
  drawRow([{ label: "Data de Emissão da Carteira", value: formData.dataEmissao, widthPct: 0.4 }]);

  drawSectionHeader("Atividades Profissionais");
  drawRow([{ label: "Empresa onde Trabalha", value: formData.empresaOndeTrabalha, widthPct: 1 }]);
  drawRow([
    { label: "Data de Admissão", value: formData.dataAdmissao, widthPct: 0.33 },
    { label: "Cargo", value: formData.cargo, widthPct: 0.33 },
    { label: "Telefone", value: formData.telefoneEmpresa, widthPct: 0.34 },
  ]);
  drawRow([{ label: "Endereço da Empresa", value: formData.enderecoEmpresa, widthPct: 1 }]);

  if (formData.dependentes && formData.dependentes.length > 0) {
    drawSectionHeader("Dependentes para Unimed");

    const colWidths = [0.35, 0.25, 0.2, 0.2];
    const headers = ["Nome", "Parentesco", "Nascimento", "CPF"];
    const gap = 8;
    const totalGaps = gap * 3;
    const availableWidth = CONTENT_WIDTH - totalGaps;

    ensureSpace(16);
    let hx = MARGIN;
    for (let i = 0; i < headers.length; i++) {
      page.drawText(headers[i].toUpperCase(), {
        x: hx,
        y,
        size: 6.5,
        font: boldFont,
        color: GRAY,
      });
      hx += availableWidth * colWidths[i] + gap;
    }
    y -= LINE_HEIGHT;

    for (const dep of formData.dependentes) {
      ensureSpace(14);
      const values = [dep.nome, dep.parentesco, dep.nascimento, dep.cpf];
      let dx = MARGIN;
      for (let i = 0; i < values.length; i++) {
        page.drawText(values[i] || "—", {
          x: dx,
          y,
          size: 9,
          font: regularFont,
          color: BLACK,
        });
        dx += availableWidth * colWidths[i] + gap;
      }
      y -= LINE_HEIGHT + 2;
    }
  }

  ensureSpace(80);
  y -= 20;

  page.drawText("Observações:", {
    x: MARGIN,
    y,
    size: 7,
    font: boldFont,
    color: GRAY,
  });
  y -= 12;
  page.drawText("1) Para profissional: anexar cópia da carteira do CREA/CAU ou diploma comprovante de endereço.", {
    x: MARGIN,
    y,
    size: 7,
    font: regularFont,
    color: GRAY,
  });
  y -= 11;
  page.drawText("2) A inadimplência com as contribuições sociais acarretará perda(s) dos serviço(s)/benefício(s).", {
    x: MARGIN,
    y,
    size: 7,
    font: regularFont,
    color: GRAY,
  });

  y -= 30;
  const dateStr = new Date().toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  page.drawText(`Fortaleza-CE, ${dateStr}`, {
    x: MARGIN,
    y,
    size: 8,
    font: regularFont,
    color: BLACK,
  });

  y -= 35;
  page.drawLine({
    start: { x: MARGIN, y },
    end: { x: MARGIN + 200, y },
    thickness: 0.8,
    color: BLACK,
  });
  page.drawText("Assinatura Digital (ICP-Brasil)", {
    x: MARGIN,
    y: y - 12,
    size: 7,
    font: regularFont,
    color: GRAY,
  });
  page.drawText(formData.nome, {
    x: MARGIN,
    y: y - 22,
    size: 8,
    font: boldFont,
    color: BLACK,
  });
  page.drawText(`CPF: ${formData.cpf}`, {
    x: MARGIN,
    y: y - 33,
    size: 7,
    font: regularFont,
    color: GRAY,
  });

  page.drawRectangle({
    x: 0,
    y: 0,
    width: PAGE_WIDTH,
    height: 20,
    color: DARK_BLUE,
  });
  page.drawText("Sindicato dos Engenheiros no Estado do Ceará — SENGE-CE", {
    x: PAGE_WIDTH / 2 - 130,
    y: 7,
    size: 7,
    font: regularFont,
    color: rgb(1, 1, 1),
  });

  return await pdfDoc.save();
}
