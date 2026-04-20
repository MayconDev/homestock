import { useEffect, useMemo, useRef, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toPng } from "html-to-image";

import CardResumo from "../components/CardResumo";
import api from "../services/api";

export default function Dashboard() {
  const [produtos, setProdutos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const graficoCategoriaRef = useRef(null);
  const graficoStatusRef = useRef(null);

  useEffect(() => {
    async function carregarDashboard() {
      try {
        const [resProdutos, resCategorias] = await Promise.all([
          api.get("/produtos/"),
          api.get("/categorias/"),
        ]);

        setProdutos(resProdutos.data);
        setCategorias(resCategorias.data);
      } catch (error) {
        setErro("Não foi possível carregar os dados do dashboard.");
        console.error(error);
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  const totalProdutos = produtos.length;
  const totalCategorias = categorias.length;
  const totalVencidos = produtos.filter((produto) => produto.esta_vencido).length;
  const totalEstoqueBaixo = produtos.filter((produto) => produto.estoque_baixo).length;
  const totalVenceEmBreve = produtos.filter((produto) => produto.vence_em_breve).length;

  const dadosPorCategoria = useMemo(() => {
    const mapa = {};

    produtos.forEach((produto) => {
      const nomeCategoria = produto.categoria_nome || "Sem categoria";

      if (!mapa[nomeCategoria]) {
        mapa[nomeCategoria] = 0;
      }

      mapa[nomeCategoria] += 1;
    });

    return Object.entries(mapa).map(([categoria, quantidade]) => ({
      categoria,
      quantidade,
    }));
  }, [produtos]);

  const dadosStatusProdutos = useMemo(() => {
    const vencidos = produtos.filter((produto) => produto.esta_vencido).length;
    const estoqueBaixo = produtos.filter((produto) => produto.estoque_baixo).length;
    const emDia = produtos.filter(
      (produto) => !produto.esta_vencido && !produto.estoque_baixo
    ).length;

    return [
      { nome: "Em dia", valor: emDia },
      { nome: "Vencidos", valor: vencidos },
      { nome: "Estoque baixo", valor: estoqueBaixo },
    ];
  }, [produtos]);

  const coresPizza = ["#22c55e", "#dc2626", "#f59e0b"];

  async function gerarPDFUltraPremium() {
    try {
      const doc = new jsPDF("p", "mm", "a4");
      const dataAtual = new Date();

      const dataFormatada =
        dataAtual.toLocaleDateString("pt-BR") +
        " " +
        dataAtual.toLocaleTimeString("pt-BR");

      // Cabeçalho
      doc.setFillColor(37, 99, 235);
      doc.rect(0, 0, 210, 35, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.text("HomeStock", 14, 16);
      doc.setFontSize(11);
      doc.text("Relatório Ultra Premium de Estoque Doméstico", 14, 25);

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.text(`Emitido em: ${dataFormatada}`, 14, 44);

      // Resumo
      doc.setFillColor(243, 244, 246);
      doc.roundedRect(14, 50, 182, 28, 3, 3, "F");

      doc.setFontSize(12);
      doc.text("Resumo Executivo", 18, 58);

      doc.setFontSize(10);
      doc.text(`Total de produtos: ${totalProdutos}`, 18, 66);
      doc.text(`Categorias: ${totalCategorias}`, 18, 72);

      doc.text(`Produtos vencidos: ${totalVencidos}`, 88, 66);
      doc.text(`Vence em breve: ${totalVenceEmBreve}`, 88, 72);

      doc.text(`Estoque baixo: ${totalEstoqueBaixo}`, 150, 66);

      let yTabela = 90;

      // Captura gráfico 1
      if (graficoCategoriaRef.current) {
        const imgCategoria = await toPng(graficoCategoriaRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });

        doc.setFontSize(11);
        doc.text("Produtos por Categoria", 14, 88);
        doc.addImage(imgCategoria, "PNG", 14, 92, 84, 58);
      }

      // Captura gráfico 2
      if (graficoStatusRef.current) {
        const imgStatus = await toPng(graficoStatusRef.current, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#ffffff",
        });

        doc.setFontSize(11);
        doc.text("Status dos Produtos", 110, 88);
        doc.addImage(imgStatus, "PNG", 110, 92, 84, 58);
      }

      yTabela = 160;

      const linhas = produtos.map((produto) => {
        let status = "Em dia";

        if (produto.esta_vencido) {
          status = "Vencido";
        } else if (produto.vence_em_breve) {
          status = "Vence em breve";
        }

        if (produto.estoque_baixo) {
          status += " / Estoque baixo";
        }

        return [
          produto.nome,
          produto.categoria_nome || "-",
          `${produto.quantidade} ${produto.unidade_medida}`,
          produto.data_validade || "Sem validade",
          status,
        ];
      });

      autoTable(doc, {
        startY: yTabela,
        head: [["Produto", "Categoria", "Quantidade", "Validade", "Status"]],
        body: linhas,
        styles: {
          fontSize: 9,
          cellPadding: 3,
          valign: "middle",
        },
        headStyles: {
          fillColor: [37, 99, 235],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        didDrawPage: function (data) {
          const pageNumber = doc.getNumberOfPages();

          doc.setFontSize(9);
          doc.setTextColor(120);
          doc.text(
            `Página ${pageNumber}`,
            data.settings.margin.left,
            doc.internal.pageSize.height - 10
          );
          doc.text(
            "HomeStock © Relatório Gerencial",
            130,
            doc.internal.pageSize.height - 10
          );
        },
      });

      doc.save("HomeStock-Relatorio-Ultra-Premium.pdf");
    } catch (error) {
      console.error("Erro ao gerar PDF ultra premium:", error);
      alert("Não foi possível gerar o PDF ultra premium.");
    }
  }

  return (
    <div>
      <div className="section-header">
        <h2 className="page-title">Dashboard</h2>
        <button className="pdf-btn" onClick={gerarPDFUltraPremium}>
          Gerar PDF Ultra Premium
        </button>
      </div>

      {carregando && <p>Carregando dashboard...</p>}
      {erro && <p className="erro-login">{erro}</p>}

      {!carregando && !erro && (
        <>
          <div className="cards-grid">
            <CardResumo titulo="Total de Produtos" valor={totalProdutos} />
            <CardResumo titulo="Categorias" valor={totalCategorias} />
            <CardResumo titulo="Produtos Vencidos" valor={totalVencidos} />
            <CardResumo titulo="Estoque Baixo" valor={totalEstoqueBaixo} />
          </div>

          <div className="cards-grid dashboard-mini-grid">
            <CardResumo titulo="Vence em Breve" valor={totalVenceEmBreve} />
          </div>

          <div className="dashboard-chart-grid">
            <div className="chart-box" ref={graficoCategoriaRef}>
              <h3>Produtos por Categoria</h3>

              {dadosPorCategoria.length > 0 ? (
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart data={dadosPorCategoria}>
                    <XAxis dataKey="categoria" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="quantidade" fill="#2563eb" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p>Nenhum dado para exibir no gráfico.</p>
              )}
            </div>

            <div className="chart-box" ref={graficoStatusRef}>
              <h3>Status dos Produtos</h3>

              {dadosStatusProdutos.some((item) => item.valor > 0) ? (
                <ResponsiveContainer width="100%" height={320}>
                  <PieChart>
                    <Pie
                      data={dadosStatusProdutos}
                      dataKey="valor"
                      nameKey="nome"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {dadosStatusProdutos.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={coresPizza[index % coresPizza.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p>Nenhum dado para exibir no gráfico.</p>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}