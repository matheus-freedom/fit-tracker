import React, { useState, useEffect, useMemo } from "react";

/*
 * ============================================================================
 *  FIT TRACKER v2 — App pessoal de treino, dieta e evolução física
 * ============================================================================
 *
 *  PERSISTÊNCIA: tudo salvo no localStorage do navegador (chave fittracker_v2).
 *  Dentro do chat da Claude o localStorage é bloqueado pela sandbox — só
 *  persiste de verdade quando publicado via GitHub -> Netlify.
 *
 *  MAPA DO ARQUIVO (Ctrl+F):
 *    [BASE]     base de 260+ alimentos (gerada por script, valores por 100g)
 *    [PERFIL]   seus dados e metas de macro
 *    [FORMULAS] nota do físico, calorias treino (MET), dobras cutâneas
 *    [STORE]    salvar/carregar localStorage
 *    [UI-HOJE]  diário, busca, refeições salvas, IA simulada
 *    [UI-MED]   medidas: InBody + dobras 3/7
 *    [UI-TREI]  fichas editáveis + treino ativo
 *    [UI-DASH]  dashboard de déficit/superávit
 *    [APP]      componente principal
 * ============================================================================
 */

// ============================ [BASE] ========================================
const ALIMENTOS_BASE = [{"nome": "Abacate", "cat": "Fruta", "kcal": 96, "p": 1.2, "c": 6, "g": 8.4, "porcoes": [{"rotulo": "1/2 unidade", "g": 100}]}, {"nome": "Abacaxi", "cat": "Fruta", "kcal": 48, "p": 0.9, "c": 12, "g": 0.1, "porcoes": [{"rotulo": "1 fatia", "g": 80}]}, {"nome": "Abobrinha refogada", "cat": "Vegetal", "kcal": 20, "p": 1.2, "c": 4, "g": 0.2, "porcoes": [{"rotulo": "1 porção", "g": 80}]}, {"nome": "Abóbora cozida", "cat": "Vegetal", "kcal": 26, "p": 1, "c": 6.5, "g": 0.1, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "Acém moído (hambúrguer caseiro)", "cat": "Proteína", "kcal": 220, "p": 18, "c": 0, "g": 16, "porcoes": [{"rotulo": "1 hambúrguer 150g", "g": 150}]}, {"nome": "Albumina", "cat": "Suplemento", "kcal": 380, "p": 80, "c": 4, "g": 1, "porcoes": [{"rotulo": "1 colher sopa", "g": 15}]}, {"nome": "Alcatra grelhada", "cat": "Proteína", "kcal": 195, "p": 28, "c": 0, "g": 9, "porcoes": [{"rotulo": "1 bife", "g": 120}]}, {"nome": "Alface", "cat": "Vegetal", "kcal": 15, "p": 1.4, "c": 2.9, "g": 0.2, "porcoes": [{"rotulo": "1 prato", "g": 50}]}, {"nome": "Ameixa", "cat": "Fruta", "kcal": 53, "p": 0.8, "c": 14, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 60}]}, {"nome": "Amendoim", "cat": "Gordura", "kcal": 567, "p": 26, "c": 16, "g": 49, "porcoes": [{"rotulo": "1 punhado", "g": 30}]}, {"nome": "Amêndoas", "cat": "Gordura", "kcal": 579, "p": 21, "c": 22, "g": 50, "porcoes": [{"rotulo": "1 punhado", "g": 30}]}, {"nome": "Arroz branco cozido", "cat": "Carboidrato", "kcal": 128, "p": 2.5, "c": 28, "g": 0.2, "porcoes": [{"rotulo": "1 colher sopa", "g": 25}, {"rotulo": "1 escumadeira", "g": 90}]}, {"nome": "Arroz de forno", "cat": "Preparo", "kcal": 180, "p": 8, "c": 22, "g": 7, "porcoes": [{"rotulo": "1 porção", "g": 200}]}, {"nome": "Arroz integral cozido", "cat": "Carboidrato", "kcal": 124, "p": 2.6, "c": 26, "g": 1, "porcoes": [{"rotulo": "1 colher sopa", "g": 25}, {"rotulo": "1 escumadeira", "g": 90}]}, {"nome": "Arroz parboilizado cozido", "cat": "Carboidrato", "kcal": 123, "p": 2.6, "c": 26, "g": 0.3, "porcoes": [{"rotulo": "1 colher sopa", "g": 25}]}, {"nome": "Atum em água (lata)", "cat": "Proteína", "kcal": 116, "p": 26, "c": 0, "g": 1, "porcoes": [{"rotulo": "1 lata", "g": 120}]}, {"nome": "Atum em óleo (lata)", "cat": "Proteína", "kcal": 190, "p": 25, "c": 0, "g": 10, "porcoes": [{"rotulo": "1 lata", "g": 120}]}, {"nome": "Aveia em flocos", "cat": "Carboidrato", "kcal": 394, "p": 14, "c": 67, "g": 8, "porcoes": [{"rotulo": "1 colher sopa", "g": 15}]}, {"nome": "Azeite de oliva", "cat": "Gordura", "kcal": 884, "p": 0, "c": 0, "g": 100, "porcoes": [{"rotulo": "1 colher sopa", "g": 13}]}, {"nome": "Azeitona", "cat": "Gordura", "kcal": 115, "p": 0.8, "c": 6, "g": 11, "porcoes": [{"rotulo": "1 unidade", "g": 4}]}, {"nome": "Açaí (polpa pura)", "cat": "Fruta", "kcal": 58, "p": 0.8, "c": 6, "g": 3.9, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "Açaí com complementos", "cat": "Doce/Snack", "kcal": 250, "p": 3, "c": 40, "g": 9, "porcoes": [{"rotulo": "1 copo 300ml", "g": 300}]}, {"nome": "Açaí na tigela (c/ banana+granola)", "cat": "Doce/Snack", "kcal": 200, "p": 3, "c": 35, "g": 6, "porcoes": [{"rotulo": "1 tigela 300g", "g": 300}]}, {"nome": "Açúcar refinado", "cat": "Doce/Snack", "kcal": 387, "p": 0, "c": 100, "g": 0, "porcoes": [{"rotulo": "1 colher chá", "g": 5}]}, {"nome": "Bacalhau cozido", "cat": "Proteína", "kcal": 105, "p": 23, "c": 0, "g": 0.9, "porcoes": []}, {"nome": "Bacon frito", "cat": "Proteína", "kcal": 540, "p": 37, "c": 1.4, "g": 42, "porcoes": [{"rotulo": "1 fatia", "g": 15}]}, {"nome": "Banana nanica", "cat": "Fruta", "kcal": 92, "p": 1.4, "c": 24, "g": 0.1, "porcoes": [{"rotulo": "1 unidade", "g": 100}]}, {"nome": "Banana prata", "cat": "Fruta", "kcal": 98, "p": 1.3, "c": 26, "g": 0.1, "porcoes": [{"rotulo": "1 unidade", "g": 70}]}, {"nome": "Barra de cereal", "cat": "Doce/Snack", "kcal": 380, "p": 6, "c": 70, "g": 8, "porcoes": [{"rotulo": "1 unidade", "g": 25}]}, {"nome": "Barra de proteína", "cat": "Suplemento", "kcal": 350, "p": 30, "c": 35, "g": 9, "porcoes": [{"rotulo": "1 unidade", "g": 60}]}, {"nome": "Barra de proteína (genérica)", "cat": "Suplemento", "kcal": 350, "p": 25, "c": 35, "g": 10, "porcoes": [{"rotulo": "1 unidade", "g": 60}]}, {"nome": "Batata doce cozida", "cat": "Carboidrato", "kcal": 77, "p": 1.3, "c": 18, "g": 0.1, "porcoes": [{"rotulo": "1 unidade média", "g": 150}]}, {"nome": "Batata frita", "cat": "Fast Food", "kcal": 312, "p": 3.4, "c": 41, "g": 15, "porcoes": [{"rotulo": "1 porção pequena", "g": 100}]}, {"nome": "Batata frita McDonald's grande", "cat": "Fast Food", "kcal": 444, "p": 5, "c": 58, "g": 21, "porcoes": [{"rotulo": "1 porção", "g": 154}]}, {"nome": "Batata inglesa cozida", "cat": "Carboidrato", "kcal": 86, "p": 1.8, "c": 20, "g": 0.1, "porcoes": [{"rotulo": "1 unidade média", "g": 150}]}, {"nome": "Batata McCain (air fryer)", "cat": "Carboidrato", "kcal": 160, "p": 2, "c": 24, "g": 6, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "BCAA", "cat": "Suplemento", "kcal": 0, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 dose", "g": 5}]}, {"nome": "Berinjela", "cat": "Vegetal", "kcal": 25, "p": 1, "c": 6, "g": 0.2, "porcoes": []}, {"nome": "Beterraba cozida", "cat": "Vegetal", "kcal": 44, "p": 1.7, "c": 10, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 80}]}, {"nome": "Big Mac (McDonald's)", "cat": "Fast Food", "kcal": 257, "p": 12, "c": 20, "g": 14, "porcoes": [{"rotulo": "1 unidade", "g": 215}]}, {"nome": "Biscoito de polvilho", "cat": "Doce/Snack", "kcal": 460, "p": 3, "c": 75, "g": 16, "porcoes": [{"rotulo": "1 punhado", "g": 20}]}, {"nome": "Biscoito recheado", "cat": "Doce/Snack", "kcal": 470, "p": 6, "c": 70, "g": 18, "porcoes": [{"rotulo": "1 unidade", "g": 12}]}, {"nome": "Biscoito água e sal", "cat": "Doce/Snack", "kcal": 430, "p": 9, "c": 70, "g": 12, "porcoes": [{"rotulo": "1 unidade", "g": 6}]}, {"nome": "Bisteca suína", "cat": "Proteína", "kcal": 260, "p": 25, "c": 0, "g": 18, "porcoes": [{"rotulo": "1 bisteca", "g": 120}]}, {"nome": "Bolacha maizena", "cat": "Doce/Snack", "kcal": 440, "p": 7, "c": 75, "g": 12, "porcoes": [{"rotulo": "1 unidade", "g": 7}]}, {"nome": "Bolo de chocolate", "cat": "Doce/Snack", "kcal": 370, "p": 5, "c": 53, "g": 15, "porcoes": [{"rotulo": "1 fatia", "g": 80}]}, {"nome": "Bolo simples/fubá", "cat": "Doce/Snack", "kcal": 320, "p": 5, "c": 50, "g": 11, "porcoes": [{"rotulo": "1 fatia", "g": 70}]}, {"nome": "Brigadeiro", "cat": "Doce/Snack", "kcal": 380, "p": 4, "c": 55, "g": 16, "porcoes": [{"rotulo": "1 unidade", "g": 20}]}, {"nome": "Brócolis cozido", "cat": "Vegetal", "kcal": 35, "p": 2.4, "c": 7, "g": 0.4, "porcoes": [{"rotulo": "1 porção", "g": 80}]}, {"nome": "Café com leite s/ açúcar", "cat": "Bebida", "kcal": 30, "p": 2, "c": 3, "g": 1, "porcoes": [{"rotulo": "1 xícara", "g": 150}]}, {"nome": "Café preto s/ açúcar", "cat": "Bebida", "kcal": 2, "p": 0.1, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 xícara", "g": 50}]}, {"nome": "Caipirinha", "cat": "Bebida", "kcal": 150, "p": 0, "c": 18, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Camarão cozido", "cat": "Proteína", "kcal": 99, "p": 24, "c": 0.2, "g": 0.3, "porcoes": []}, {"nome": "Cappuccino", "cat": "Bebida", "kcal": 75, "p": 3, "c": 11, "g": 2.5, "porcoes": [{"rotulo": "1 xícara", "g": 150}]}, {"nome": "Caqui", "cat": "Fruta", "kcal": 71, "p": 0.6, "c": 19, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 100}]}, {"nome": "Carne moída comum (refogada)", "cat": "Proteína", "kcal": 250, "p": 24, "c": 0, "g": 17, "porcoes": []}, {"nome": "Carne seca dessalgada", "cat": "Proteína", "kcal": 313, "p": 33, "c": 0, "g": 20, "porcoes": []}, {"nome": "Caseína", "cat": "Suplemento", "kcal": 360, "p": 78, "c": 6, "g": 2, "porcoes": [{"rotulo": "1 scoop 30g", "g": 30}]}, {"nome": "Castanha de caju", "cat": "Gordura", "kcal": 553, "p": 18, "c": 30, "g": 44, "porcoes": [{"rotulo": "1 punhado", "g": 30}]}, {"nome": "Castanha do pará", "cat": "Gordura", "kcal": 656, "p": 14, "c": 12, "g": 66, "porcoes": [{"rotulo": "1 unidade", "g": 5}]}, {"nome": "Castanhas mix", "cat": "Gordura", "kcal": 600, "p": 17, "c": 20, "g": 53, "porcoes": [{"rotulo": "1 punhado", "g": 30}]}, {"nome": "Cebola", "cat": "Vegetal", "kcal": 40, "p": 1.1, "c": 9, "g": 0.1, "porcoes": [{"rotulo": "1 unidade", "g": 70}]}, {"nome": "Cenoura crua", "cat": "Vegetal", "kcal": 41, "p": 0.9, "c": 10, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 80}]}, {"nome": "Cerveja IPA/artesanal", "cat": "Bebida", "kcal": 60, "p": 0.6, "c": 5, "g": 0, "porcoes": [{"rotulo": "1 copo 300ml", "g": 300}]}, {"nome": "Cerveja pilsen", "cat": "Bebida", "kcal": 42, "p": 0.5, "c": 3.5, "g": 0, "porcoes": [{"rotulo": "1 lata 350ml", "g": 350}, {"rotulo": "1 long neck", "g": 355}]}, {"nome": "Cerveja sem álcool", "cat": "Bebida", "kcal": 25, "p": 0.4, "c": 5, "g": 0, "porcoes": [{"rotulo": "1 lata 350ml", "g": 350}]}, {"nome": "Cheeseburger (McDonald's)", "cat": "Fast Food", "kcal": 270, "p": 14, "c": 30, "g": 11, "porcoes": [{"rotulo": "1 unidade", "g": 115}]}, {"nome": "Chocolate 70% cacau", "cat": "Doce/Snack", "kcal": 580, "p": 8, "c": 46, "g": 38, "porcoes": [{"rotulo": "1 quadradinho", "g": 5}]}, {"nome": "Chocolate ao leite", "cat": "Doce/Snack", "kcal": 535, "p": 7.7, "c": 59, "g": 30, "porcoes": [{"rotulo": "1 barra pequena", "g": 25}]}, {"nome": "Chuchu cozido", "cat": "Vegetal", "kcal": 19, "p": 0.8, "c": 4.5, "g": 0.1, "porcoes": []}, {"nome": "Chá mate gelado (adoçado)", "cat": "Bebida", "kcal": 35, "p": 0, "c": 9, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Chá s/ açúcar", "cat": "Bebida", "kcal": 1, "p": 0, "c": 0.2, "g": 0, "porcoes": [{"rotulo": "1 xícara", "g": 200}]}, {"nome": "Clara de ovo", "cat": "Proteína", "kcal": 52, "p": 11, "c": 0.7, "g": 0.2, "porcoes": [{"rotulo": "1 clara", "g": 33}]}, {"nome": "Coco fresco", "cat": "Fruta", "kcal": 354, "p": 3.3, "c": 15, "g": 33, "porcoes": []}, {"nome": "Coco ralado", "cat": "Gordura", "kcal": 660, "p": 7, "c": 24, "g": 64, "porcoes": [{"rotulo": "1 colher sopa", "g": 10}]}, {"nome": "Cogumelo champignon", "cat": "Vegetal", "kcal": 22, "p": 3.1, "c": 3.3, "g": 0.3, "porcoes": []}, {"nome": "Contra-filé grelhado", "cat": "Proteína", "kcal": 220, "p": 26, "c": 0, "g": 13, "porcoes": [{"rotulo": "1 bife", "g": 120}]}, {"nome": "Cookie", "cat": "Doce/Snack", "kcal": 480, "p": 6, "c": 64, "g": 22, "porcoes": [{"rotulo": "1 unidade", "g": 30}]}, {"nome": "Coração de frango", "cat": "Proteína", "kcal": 153, "p": 26, "c": 0, "g": 5, "porcoes": []}, {"nome": "Costela bovina", "cat": "Proteína", "kcal": 330, "p": 21, "c": 0, "g": 27, "porcoes": []}, {"nome": "Costelinha suína", "cat": "Proteína", "kcal": 290, "p": 23, "c": 0, "g": 22, "porcoes": []}, {"nome": "Couve refogada", "cat": "Vegetal", "kcal": 90, "p": 3, "c": 7, "g": 6, "porcoes": [{"rotulo": "1 porção", "g": 60}]}, {"nome": "Couve-flor cozida", "cat": "Vegetal", "kcal": 25, "p": 1.9, "c": 5, "g": 0.3, "porcoes": [{"rotulo": "1 porção", "g": 80}]}, {"nome": "Coxinha", "cat": "Fast Food", "kcal": 270, "p": 8, "c": 30, "g": 13, "porcoes": [{"rotulo": "1 unidade", "g": 80}]}, {"nome": "Cream cheese light", "cat": "Laticínio", "kcal": 230, "p": 7, "c": 5, "g": 20, "porcoes": [{"rotulo": "1 colher sopa", "g": 30}]}, {"nome": "Creatina", "cat": "Suplemento", "kcal": 0, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 dose 3g", "g": 3}]}, {"nome": "Creme de leite", "cat": "Laticínio", "kcal": 210, "p": 2.5, "c": 4, "g": 20, "porcoes": [{"rotulo": "1 colher sopa", "g": 15}]}, {"nome": "Crepioca (ovo+tapioca)", "cat": "Carboidrato", "kcal": 180, "p": 9, "c": 18, "g": 8, "porcoes": [{"rotulo": "1 unidade", "g": 90}]}, {"nome": "Cuscuz de milho cozido", "cat": "Carboidrato", "kcal": 112, "p": 2.2, "c": 24, "g": 0.7, "porcoes": [{"rotulo": "1 fatia", "g": 100}]}, {"nome": "Doce de leite", "cat": "Doce/Snack", "kcal": 315, "p": 6, "c": 55, "g": 7, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Empada de frango", "cat": "Fast Food", "kcal": 320, "p": 8, "c": 32, "g": 18, "porcoes": [{"rotulo": "1 unidade", "g": 90}]}, {"nome": "Energético", "cat": "Bebida", "kcal": 45, "p": 0, "c": 11, "g": 0, "porcoes": [{"rotulo": "1 lata 250ml", "g": 250}]}, {"nome": "Energético zero", "cat": "Bebida", "kcal": 3, "p": 0, "c": 0.5, "g": 0, "porcoes": [{"rotulo": "1 lata 250ml", "g": 250}]}, {"nome": "Ervilha cozida", "cat": "Leguminosa", "kcal": 84, "p": 5.4, "c": 14, "g": 0.4, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Escondidinho de carne", "cat": "Preparo", "kcal": 150, "p": 8, "c": 14, "g": 7, "porcoes": [{"rotulo": "1 porção", "g": 200}]}, {"nome": "Esfiha de carne", "cat": "Fast Food", "kcal": 240, "p": 10, "c": 30, "g": 9, "porcoes": [{"rotulo": "1 unidade", "g": 80}]}, {"nome": "Espinafre cozido", "cat": "Vegetal", "kcal": 23, "p": 2.9, "c": 3.6, "g": 0.4, "porcoes": []}, {"nome": "Farinha de mandioca", "cat": "Carboidrato", "kcal": 361, "p": 1.5, "c": 88, "g": 0.3, "porcoes": [{"rotulo": "1 colher sopa", "g": 15}]}, {"nome": "Farofa pronta", "cat": "Preparo", "kcal": 408, "p": 2, "c": 75, "g": 11, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Feijoada", "cat": "Preparo", "kcal": 250, "p": 14, "c": 14, "g": 15, "porcoes": [{"rotulo": "1 concha", "g": 150}]}, {"nome": "Feijão carioca cozido", "cat": "Leguminosa", "kcal": 76, "p": 4.8, "c": 13.6, "g": 0.5, "porcoes": [{"rotulo": "1 concha", "g": 90}]}, {"nome": "Feijão preto cozido", "cat": "Leguminosa", "kcal": 77, "p": 4.5, "c": 14, "g": 0.5, "porcoes": [{"rotulo": "1 concha", "g": 90}]}, {"nome": "Feijão tropeiro", "cat": "Preparo", "kcal": 180, "p": 9, "c": 22, "g": 6, "porcoes": [{"rotulo": "1 colher sopa", "g": 40}]}, {"nome": "Figo", "cat": "Fruta", "kcal": 74, "p": 0.8, "c": 19, "g": 0.3, "porcoes": [{"rotulo": "1 unidade", "g": 50}]}, {"nome": "Filé mignon", "cat": "Proteína", "kcal": 200, "p": 28, "c": 0, "g": 9.5, "porcoes": [{"rotulo": "1 medalhão", "g": 100}]}, {"nome": "Frango, coxa assada (com pele)", "cat": "Proteína", "kcal": 215, "p": 26, "c": 0, "g": 12, "porcoes": [{"rotulo": "1 coxa", "g": 90}]}, {"nome": "Frango, filé/sassami grelhado", "cat": "Proteína", "kcal": 165, "p": 31, "c": 0, "g": 3.6, "porcoes": [{"rotulo": "1 filé médio", "g": 100}]}, {"nome": "Frango, peito cozido", "cat": "Proteína", "kcal": 159, "p": 30, "c": 0, "g": 3.5, "porcoes": [{"rotulo": "1 filé", "g": 120}]}, {"nome": "Frango, sobrecoxa", "cat": "Proteína", "kcal": 210, "p": 25, "c": 0, "g": 12, "porcoes": [{"rotulo": "1 unidade", "g": 110}]}, {"nome": "Frutas vermelhas (mix)", "cat": "Fruta", "kcal": 50, "p": 1, "c": 12, "g": 0.3, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "Fígado bovino grelhado", "cat": "Proteína", "kcal": 175, "p": 27, "c": 3.9, "g": 5, "porcoes": [{"rotulo": "1 bife", "g": 100}]}, {"nome": "Gatorade/isotônico", "cat": "Bebida", "kcal": 26, "p": 0, "c": 6.5, "g": 0, "porcoes": [{"rotulo": "1 garrafa 500ml", "g": 500}]}, {"nome": "Gelatina (pronta)", "cat": "Doce/Snack", "kcal": 70, "p": 1.5, "c": 16, "g": 0, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "Gelatina diet/zero", "cat": "Doce/Snack", "kcal": 8, "p": 1.5, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "Geleia de frutas", "cat": "Doce/Snack", "kcal": 250, "p": 0.4, "c": 62, "g": 0.1, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Gin com tônica", "cat": "Bebida", "kcal": 120, "p": 0, "c": 9, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Goiaba", "cat": "Fruta", "kcal": 54, "p": 1.1, "c": 13, "g": 0.4, "porcoes": [{"rotulo": "1 unidade", "g": 130}]}, {"nome": "Granola", "cat": "Carboidrato", "kcal": 450, "p": 10, "c": 64, "g": 16, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Grão-de-bico cozido", "cat": "Leguminosa", "kcal": 164, "p": 8.9, "c": 27, "g": 2.6, "porcoes": [{"rotulo": "1 concha", "g": 90}]}, {"nome": "Hipercalórico (massa)", "cat": "Suplemento", "kcal": 380, "p": 20, "c": 65, "g": 4, "porcoes": [{"rotulo": "1 dose 100g", "g": 100}]}, {"nome": "Hot dog completo", "cat": "Fast Food", "kcal": 290, "p": 11, "c": 33, "g": 13, "porcoes": [{"rotulo": "1 unidade", "g": 150}]}, {"nome": "Inhame cozido", "cat": "Carboidrato", "kcal": 97, "p": 2, "c": 23, "g": 0.2, "porcoes": []}, {"nome": "Iogurte grego zero", "cat": "Laticínio", "kcal": 60, "p": 9, "c": 4, "g": 0, "porcoes": [{"rotulo": "1 pote 100g", "g": 100}]}, {"nome": "Iogurte natural desnatado", "cat": "Laticínio", "kcal": 41, "p": 4, "c": 6, "g": 0.2, "porcoes": [{"rotulo": "1 pote 170g", "g": 170}]}, {"nome": "Iogurte natural integral", "cat": "Laticínio", "kcal": 61, "p": 3.5, "c": 4.7, "g": 3.3, "porcoes": [{"rotulo": "1 pote 170g", "g": 170}]}, {"nome": "Iogurte zero açúcar/lactose", "cat": "Laticínio", "kcal": 35, "p": 6, "c": 3, "g": 0, "porcoes": [{"rotulo": "1 pote 170g", "g": 170}]}, {"nome": "Kibe frito", "cat": "Fast Food", "kcal": 280, "p": 11, "c": 24, "g": 16, "porcoes": [{"rotulo": "1 unidade", "g": 80}]}, {"nome": "Kiwi", "cat": "Fruta", "kcal": 51, "p": 1.3, "c": 11, "g": 0.6, "porcoes": [{"rotulo": "1 unidade", "g": 75}]}, {"nome": "Laranja", "cat": "Fruta", "kcal": 45, "p": 1, "c": 11, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 130}]}, {"nome": "Lasanha à bolonhesa", "cat": "Preparo", "kcal": 165, "p": 9, "c": 15, "g": 8, "porcoes": [{"rotulo": "1 pedaço", "g": 200}]}, {"nome": "Leite achocolatado", "cat": "Bebida", "kcal": 83, "p": 3, "c": 14, "g": 2, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Leite condensado", "cat": "Doce/Snack", "kcal": 321, "p": 7.5, "c": 55, "g": 8.7, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Leite desnatado", "cat": "Laticínio", "kcal": 35, "p": 3.4, "c": 5, "g": 0.1, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Leite desnatado s/ lactose", "cat": "Laticínio", "kcal": 35, "p": 3.4, "c": 5, "g": 0.1, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Leite integral", "cat": "Laticínio", "kcal": 61, "p": 3.2, "c": 4.7, "g": 3.3, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Lentilha cozida", "cat": "Leguminosa", "kcal": 116, "p": 9, "c": 20, "g": 0.4, "porcoes": [{"rotulo": "1 concha", "g": 90}]}, {"nome": "Limão", "cat": "Fruta", "kcal": 29, "p": 1.1, "c": 9, "g": 0.3, "porcoes": [{"rotulo": "1 unidade", "g": 60}]}, {"nome": "Linguiça toscana grelhada", "cat": "Proteína", "kcal": 300, "p": 16, "c": 1, "g": 26, "porcoes": [{"rotulo": "1 gomo", "g": 80}]}, {"nome": "Lombo suíno assado", "cat": "Proteína", "kcal": 210, "p": 28, "c": 0, "g": 11, "porcoes": [{"rotulo": "1 fatia", "g": 80}]}, {"nome": "Macarrão cozido", "cat": "Carboidrato", "kcal": 158, "p": 5.8, "c": 31, "g": 0.9, "porcoes": [{"rotulo": "1 pegador", "g": 100}]}, {"nome": "Macarrão instantâneo (miojo)", "cat": "Carboidrato", "kcal": 440, "p": 9, "c": 60, "g": 18, "porcoes": [{"rotulo": "1 pacote", "g": 80}]}, {"nome": "Macarrão integral cozido", "cat": "Carboidrato", "kcal": 124, "p": 5, "c": 25, "g": 1, "porcoes": [{"rotulo": "1 pegador", "g": 100}]}, {"nome": "Maionese", "cat": "Gordura", "kcal": 680, "p": 1, "c": 2, "g": 75, "porcoes": [{"rotulo": "1 colher sopa", "g": 15}]}, {"nome": "Maminha", "cat": "Proteína", "kcal": 200, "p": 27, "c": 0, "g": 10, "porcoes": []}, {"nome": "Mamão papaia", "cat": "Fruta", "kcal": 40, "p": 0.5, "c": 10, "g": 0.1, "porcoes": [{"rotulo": "1/2 unidade", "g": 150}]}, {"nome": "Mandioca/aipim cozido", "cat": "Carboidrato", "kcal": 125, "p": 0.6, "c": 30, "g": 0.3, "porcoes": [{"rotulo": "1 pedaço", "g": 100}]}, {"nome": "Manga", "cat": "Fruta", "kcal": 64, "p": 0.4, "c": 16, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 200}]}, {"nome": "Manteiga c/ sal", "cat": "Gordura", "kcal": 717, "p": 0.9, "c": 0.1, "g": 81, "porcoes": [{"rotulo": "1 colher chá", "g": 5}]}, {"nome": "Manteiga s/ sal", "cat": "Gordura", "kcal": 717, "p": 0.9, "c": 0.1, "g": 81, "porcoes": [{"rotulo": "1 colher chá", "g": 5}]}, {"nome": "Maracujá (polpa)", "cat": "Fruta", "kcal": 68, "p": 2, "c": 12, "g": 0.4, "porcoes": []}, {"nome": "Margarina", "cat": "Gordura", "kcal": 596, "p": 0.5, "c": 0.6, "g": 66, "porcoes": [{"rotulo": "1 colher chá", "g": 5}]}, {"nome": "Maçã", "cat": "Fruta", "kcal": 56, "p": 0.3, "c": 15, "g": 0.4, "porcoes": [{"rotulo": "1 unidade", "g": 130}]}, {"nome": "McChicken", "cat": "Fast Food", "kcal": 260, "p": 11, "c": 27, "g": 12, "porcoes": [{"rotulo": "1 unidade", "g": 173}]}, {"nome": "McFritas média", "cat": "Fast Food", "kcal": 323, "p": 3.4, "c": 42, "g": 16, "porcoes": [{"rotulo": "1 porção", "g": 117}]}, {"nome": "Mel", "cat": "Doce/Snack", "kcal": 304, "p": 0.3, "c": 82, "g": 0, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Melancia", "cat": "Fruta", "kcal": 33, "p": 0.9, "c": 8, "g": 0.1, "porcoes": [{"rotulo": "1 fatia", "g": 200}]}, {"nome": "Melão", "cat": "Fruta", "kcal": 29, "p": 0.7, "c": 7.5, "g": 0.1, "porcoes": [{"rotulo": "1 fatia", "g": 150}]}, {"nome": "Merluza grelhada", "cat": "Proteína", "kcal": 90, "p": 18, "c": 0, "g": 1.5, "porcoes": [{"rotulo": "1 filé", "g": 100}]}, {"nome": "Mexerica/pokan", "cat": "Fruta", "kcal": 38, "p": 0.8, "c": 9.6, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 100}]}, {"nome": "Milho verde (lata)", "cat": "Carboidrato", "kcal": 98, "p": 3.3, "c": 21, "g": 1.2, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Misto quente", "cat": "Fast Food", "kcal": 270, "p": 13, "c": 28, "g": 12, "porcoes": [{"rotulo": "1 unidade", "g": 120}]}, {"nome": "Morango", "cat": "Fruta", "kcal": 30, "p": 0.7, "c": 6.8, "g": 0.3, "porcoes": [{"rotulo": "1 unidade", "g": 12}]}, {"nome": "Mortadela", "cat": "Proteína", "kcal": 310, "p": 14, "c": 3, "g": 27, "porcoes": [{"rotulo": "1 fatia", "g": 25}]}, {"nome": "Mousse de chocolate", "cat": "Doce/Snack", "kcal": 230, "p": 4, "c": 28, "g": 11, "porcoes": [{"rotulo": "1 taça", "g": 100}]}, {"nome": "Nozes", "cat": "Gordura", "kcal": 654, "p": 15, "c": 14, "g": 65, "porcoes": [{"rotulo": "1 punhado", "g": 30}]}, {"nome": "Nuggets (6 unidades)", "cat": "Fast Food", "kcal": 280, "p": 14, "c": 18, "g": 17, "porcoes": [{"rotulo": "6 unidades", "g": 96}, {"rotulo": "1 unidade", "g": 16}]}, {"nome": "Nuggets Big Chicken (air fryer)", "cat": "Fast Food", "kcal": 250, "p": 14, "c": 18, "g": 13, "porcoes": [{"rotulo": "6 unidades", "g": 100}]}, {"nome": "Omelete (2 ovos+queijo)", "cat": "Preparo", "kcal": 220, "p": 16, "c": 2, "g": 16, "porcoes": [{"rotulo": "1 unidade", "g": 130}]}, {"nome": "Ovo de codorna", "cat": "Proteína", "kcal": 158, "p": 13, "c": 0.4, "g": 11, "porcoes": [{"rotulo": "1 unidade", "g": 10}]}, {"nome": "Ovo de galinha inteiro", "cat": "Proteína", "kcal": 143, "p": 13, "c": 1.1, "g": 9.5, "porcoes": [{"rotulo": "1 ovo", "g": 50}]}, {"nome": "Ovos mexidos (2 ovos)", "cat": "Preparo", "kcal": 200, "p": 13, "c": 1.5, "g": 16, "porcoes": [{"rotulo": "1 porção", "g": 110}]}, {"nome": "Palmito", "cat": "Vegetal", "kcal": 28, "p": 2.5, "c": 4.5, "g": 0.6, "porcoes": [{"rotulo": "1 colher sopa", "g": 30}]}, {"nome": "Panqueca de carne", "cat": "Preparo", "kcal": 200, "p": 11, "c": 18, "g": 9, "porcoes": [{"rotulo": "1 unidade", "g": 120}]}, {"nome": "Panqueca simples", "cat": "Carboidrato", "kcal": 227, "p": 6, "c": 28, "g": 10, "porcoes": [{"rotulo": "1 unidade", "g": 60}]}, {"nome": "Pasta de amendoim", "cat": "Gordura", "kcal": 588, "p": 25, "c": 20, "g": 50, "porcoes": [{"rotulo": "1 colher sopa", "g": 20}]}, {"nome": "Pastel de carne (frito)", "cat": "Fast Food", "kcal": 330, "p": 9, "c": 30, "g": 19, "porcoes": [{"rotulo": "1 unidade", "g": 100}]}, {"nome": "Patinho moído cozido", "cat": "Proteína", "kcal": 219, "p": 27, "c": 0, "g": 12, "porcoes": []}, {"nome": "Paçoca", "cat": "Doce/Snack", "kcal": 480, "p": 12, "c": 55, "g": 23, "porcoes": [{"rotulo": "1 unidade", "g": 20}]}, {"nome": "Peito de peru fatiado", "cat": "Proteína", "kcal": 100, "p": 17, "c": 2, "g": 2.5, "porcoes": [{"rotulo": "1 fatia", "g": 20}]}, {"nome": "Pepino", "cat": "Vegetal", "kcal": 15, "p": 0.7, "c": 3.6, "g": 0.1, "porcoes": [{"rotulo": "1 unidade", "g": 100}]}, {"nome": "Picanha assada", "cat": "Proteína", "kcal": 290, "p": 24, "c": 0, "g": 22, "porcoes": [{"rotulo": "1 fatia", "g": 100}]}, {"nome": "Pimentão", "cat": "Vegetal", "kcal": 31, "p": 1, "c": 6, "g": 0.3, "porcoes": [{"rotulo": "1 unidade", "g": 120}]}, {"nome": "Pipoca (estourada)", "cat": "Doce/Snack", "kcal": 387, "p": 13, "c": 78, "g": 4.5, "porcoes": [{"rotulo": "1 saco micro-ondas", "g": 100}]}, {"nome": "Pizza calabresa", "cat": "Fast Food", "kcal": 290, "p": 12, "c": 31, "g": 13, "porcoes": [{"rotulo": "1 fatia", "g": 100}]}, {"nome": "Pizza muçarela", "cat": "Fast Food", "kcal": 266, "p": 11, "c": 33, "g": 10, "porcoes": [{"rotulo": "1 fatia", "g": 100}]}, {"nome": "Pizza portuguesa", "cat": "Fast Food", "kcal": 270, "p": 13, "c": 30, "g": 11, "porcoes": [{"rotulo": "1 fatia", "g": 100}]}, {"nome": "Polenta cozida", "cat": "Carboidrato", "kcal": 85, "p": 2, "c": 18, "g": 0.5, "porcoes": []}, {"nome": "Presunto magro", "cat": "Proteína", "kcal": 120, "p": 18, "c": 1.5, "g": 4.5, "porcoes": [{"rotulo": "1 fatia", "g": 20}]}, {"nome": "Pudim", "cat": "Doce/Snack", "kcal": 200, "p": 5, "c": 33, "g": 5, "porcoes": [{"rotulo": "1 fatia", "g": 100}]}, {"nome": "Purê de batata", "cat": "Preparo", "kcal": 110, "p": 2, "c": 15, "g": 5, "porcoes": [{"rotulo": "1 colher servir", "g": 80}]}, {"nome": "Pão brioche", "cat": "Carboidrato", "kcal": 330, "p": 9, "c": 55, "g": 9, "porcoes": [{"rotulo": "1 unidade", "g": 55}]}, {"nome": "Pão de forma branco", "cat": "Carboidrato", "kcal": 270, "p": 8, "c": 50, "g": 4, "porcoes": [{"rotulo": "1 fatia", "g": 25}]}, {"nome": "Pão de forma integral", "cat": "Carboidrato", "kcal": 250, "p": 11, "c": 43, "g": 4, "porcoes": [{"rotulo": "1 fatia", "g": 25}]}, {"nome": "Pão de queijo", "cat": "Carboidrato", "kcal": 300, "p": 5, "c": 38, "g": 14, "porcoes": [{"rotulo": "1 unidade", "g": 30}]}, {"nome": "Pão francês", "cat": "Carboidrato", "kcal": 300, "p": 8, "c": 59, "g": 3, "porcoes": [{"rotulo": "1 unidade", "g": 50}]}, {"nome": "Pão sírio/pita", "cat": "Carboidrato", "kcal": 275, "p": 9, "c": 55, "g": 1.2, "porcoes": [{"rotulo": "1 unidade", "g": 60}]}, {"nome": "Pêra", "cat": "Fruta", "kcal": 53, "p": 0.6, "c": 14, "g": 0.1, "porcoes": [{"rotulo": "1 unidade", "g": 130}]}, {"nome": "Quarteirão com queijo", "cat": "Fast Food", "kcal": 245, "p": 14, "c": 17, "g": 14, "porcoes": [{"rotulo": "1 unidade", "g": 200}]}, {"nome": "Queijo cottage", "cat": "Laticínio", "kcal": 98, "p": 11, "c": 3.4, "g": 4.3, "porcoes": [{"rotulo": "1 colher sopa", "g": 30}]}, {"nome": "Queijo minas frescal", "cat": "Laticínio", "kcal": 264, "p": 17, "c": 3, "g": 20, "porcoes": [{"rotulo": "1 fatia", "g": 30}]}, {"nome": "Queijo minas meia cura", "cat": "Laticínio", "kcal": 300, "p": 22, "c": 2, "g": 23, "porcoes": [{"rotulo": "1 fatia", "g": 30}]}, {"nome": "Queijo mussarela", "cat": "Laticínio", "kcal": 280, "p": 22, "c": 3, "g": 20, "porcoes": [{"rotulo": "1 fatia", "g": 20}]}, {"nome": "Queijo parmesão", "cat": "Laticínio", "kcal": 430, "p": 36, "c": 4, "g": 29, "porcoes": [{"rotulo": "1 colher sopa", "g": 10}]}, {"nome": "Queijo prato", "cat": "Laticínio", "kcal": 360, "p": 25, "c": 2, "g": 28, "porcoes": [{"rotulo": "1 fatia", "g": 20}]}, {"nome": "Quiabo", "cat": "Vegetal", "kcal": 33, "p": 1.9, "c": 7, "g": 0.2, "porcoes": []}, {"nome": "Quibe assado", "cat": "Fast Food", "kcal": 220, "p": 12, "c": 18, "g": 11, "porcoes": [{"rotulo": "1 unidade", "g": 90}]}, {"nome": "Quiche", "cat": "Preparo", "kcal": 280, "p": 9, "c": 20, "g": 18, "porcoes": [{"rotulo": "1 fatia", "g": 120}]}, {"nome": "Quinoa cozida", "cat": "Carboidrato", "kcal": 120, "p": 4.4, "c": 21, "g": 1.9, "porcoes": [{"rotulo": "1 colher sopa", "g": 25}]}, {"nome": "Refrigerante cola", "cat": "Bebida", "kcal": 42, "p": 0, "c": 10.6, "g": 0, "porcoes": [{"rotulo": "1 lata 350ml", "g": 350}]}, {"nome": "Refrigerante cola zero", "cat": "Bebida", "kcal": 0.3, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 lata 350ml", "g": 350}]}, {"nome": "Refrigerante guaraná", "cat": "Bebida", "kcal": 40, "p": 0, "c": 10, "g": 0, "porcoes": [{"rotulo": "1 lata 350ml", "g": 350}]}, {"nome": "Refrigerante laranja", "cat": "Bebida", "kcal": 48, "p": 0, "c": 12, "g": 0, "porcoes": [{"rotulo": "1 lata 350ml", "g": 350}]}, {"nome": "Repolho", "cat": "Vegetal", "kcal": 25, "p": 1.3, "c": 6, "g": 0.1, "porcoes": []}, {"nome": "Requeijão cremoso", "cat": "Laticínio", "kcal": 257, "p": 9, "c": 4, "g": 23, "porcoes": [{"rotulo": "1 colher sopa", "g": 30}]}, {"nome": "Ricota", "cat": "Laticínio", "kcal": 140, "p": 11, "c": 3, "g": 9, "porcoes": [{"rotulo": "1 fatia", "g": 30}]}, {"nome": "Risoto de frango", "cat": "Preparo", "kcal": 170, "p": 9, "c": 22, "g": 5, "porcoes": [{"rotulo": "1 porção", "g": 200}]}, {"nome": "Rúcula", "cat": "Vegetal", "kcal": 25, "p": 2.6, "c": 3.7, "g": 0.7, "porcoes": [{"rotulo": "1 prato", "g": 40}]}, {"nome": "Salada de maionese", "cat": "Preparo", "kcal": 150, "p": 2, "c": 14, "g": 9, "porcoes": [{"rotulo": "1 colher servir", "g": 80}]}, {"nome": "Salame", "cat": "Proteína", "kcal": 380, "p": 22, "c": 2, "g": 31, "porcoes": [{"rotulo": "1 fatia", "g": 8}]}, {"nome": "Salgadinho de pacote", "cat": "Doce/Snack", "kcal": 520, "p": 6, "c": 60, "g": 28, "porcoes": [{"rotulo": "1 pacote pequeno", "g": 50}]}, {"nome": "Salmão grelhado", "cat": "Proteína", "kcal": 208, "p": 22, "c": 0, "g": 13, "porcoes": [{"rotulo": "1 posta", "g": 120}]}, {"nome": "Salsicha", "cat": "Proteína", "kcal": 260, "p": 12, "c": 3, "g": 22, "porcoes": [{"rotulo": "1 unidade", "g": 50}]}, {"nome": "Sanduíche natural", "cat": "Fast Food", "kcal": 200, "p": 12, "c": 24, "g": 6, "porcoes": [{"rotulo": "1 unidade", "g": 150}]}, {"nome": "Sardinha (em óleo)", "cat": "Proteína", "kcal": 208, "p": 25, "c": 0, "g": 11, "porcoes": [{"rotulo": "1 lata", "g": 84}]}, {"nome": "Semente de chia", "cat": "Gordura", "kcal": 486, "p": 17, "c": 42, "g": 31, "porcoes": [{"rotulo": "1 colher sopa", "g": 12}]}, {"nome": "Semente de linhaça", "cat": "Gordura", "kcal": 534, "p": 18, "c": 29, "g": 42, "porcoes": [{"rotulo": "1 colher sopa", "g": 12}]}, {"nome": "Smoothie de frutas", "cat": "Bebida", "kcal": 70, "p": 1, "c": 16, "g": 0.5, "porcoes": [{"rotulo": "1 copo 300ml", "g": 300}]}, {"nome": "Soja cozida", "cat": "Leguminosa", "kcal": 173, "p": 16, "c": 10, "g": 9, "porcoes": []}, {"nome": "Sopa de legumes", "cat": "Preparo", "kcal": 45, "p": 2, "c": 8, "g": 0.8, "porcoes": [{"rotulo": "1 prato", "g": 300}]}, {"nome": "Sorvete de massa", "cat": "Doce/Snack", "kcal": 207, "p": 3.5, "c": 24, "g": 11, "porcoes": [{"rotulo": "1 bola", "g": 60}]}, {"nome": "Strogonoff de frango", "cat": "Preparo", "kcal": 165, "p": 12, "c": 7, "g": 9, "porcoes": [{"rotulo": "1 concha", "g": 120}]}, {"nome": "Suco de caixinha (néctar)", "cat": "Bebida", "kcal": 50, "p": 0, "c": 12, "g": 0, "porcoes": [{"rotulo": "1 caixinha 200ml", "g": 200}]}, {"nome": "Suco de laranja natural", "cat": "Bebida", "kcal": 45, "p": 0.7, "c": 10, "g": 0.2, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Suco de uva integral", "cat": "Bebida", "kcal": 60, "p": 0.3, "c": 15, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Suco detox verde", "cat": "Bebida", "kcal": 35, "p": 1, "c": 8, "g": 0.2, "porcoes": [{"rotulo": "1 copo 300ml", "g": 300}]}, {"nome": "Suco em pó preparado", "cat": "Bebida", "kcal": 40, "p": 0, "c": 10, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Tabule", "cat": "Preparo", "kcal": 110, "p": 3, "c": 18, "g": 3, "porcoes": [{"rotulo": "1 porção", "g": 100}]}, {"nome": "Tapioca (goma hidratada)", "cat": "Carboidrato", "kcal": 240, "p": 0, "c": 60, "g": 0, "porcoes": [{"rotulo": "1 unidade média", "g": 70}]}, {"nome": "Tapioca recheada (queijo+presunto)", "cat": "Fast Food", "kcal": 250, "p": 12, "c": 35, "g": 7, "porcoes": [{"rotulo": "1 unidade", "g": 150}]}, {"nome": "Tilápia grelhada", "cat": "Proteína", "kcal": 128, "p": 26, "c": 0, "g": 2.7, "porcoes": [{"rotulo": "1 filé", "g": 120}]}, {"nome": "Tofu", "cat": "Proteína", "kcal": 76, "p": 8, "c": 1.9, "g": 4.8, "porcoes": []}, {"nome": "Tomate", "cat": "Vegetal", "kcal": 18, "p": 0.9, "c": 3.9, "g": 0.2, "porcoes": [{"rotulo": "1 unidade", "g": 100}]}, {"nome": "Tâmara seca", "cat": "Fruta", "kcal": 282, "p": 2.5, "c": 75, "g": 0.4, "porcoes": [{"rotulo": "1 unidade", "g": 8}]}, {"nome": "Uva", "cat": "Fruta", "kcal": 53, "p": 0.7, "c": 14, "g": 0.2, "porcoes": [{"rotulo": "1 cacho pequeno", "g": 100}]}, {"nome": "Uva passa", "cat": "Fruta", "kcal": 299, "p": 3.1, "c": 79, "g": 0.5, "porcoes": [{"rotulo": "1 colher sopa", "g": 15}]}, {"nome": "Vagem cozida", "cat": "Vegetal", "kcal": 35, "p": 1.8, "c": 8, "g": 0.1, "porcoes": []}, {"nome": "Vinagrete", "cat": "Preparo", "kcal": 35, "p": 1, "c": 6, "g": 0.5, "porcoes": [{"rotulo": "1 colher sopa", "g": 30}]}, {"nome": "Vinho branco", "cat": "Bebida", "kcal": 82, "p": 0.1, "c": 2.6, "g": 0, "porcoes": [{"rotulo": "1 taça 150ml", "g": 150}]}, {"nome": "Vinho tinto", "cat": "Bebida", "kcal": 85, "p": 0.1, "c": 2.6, "g": 0, "porcoes": [{"rotulo": "1 taça 150ml", "g": 150}]}, {"nome": "Vitamina de banana c/ leite", "cat": "Bebida", "kcal": 90, "p": 3, "c": 16, "g": 2, "porcoes": [{"rotulo": "1 copo 300ml", "g": 300}]}, {"nome": "Vodka", "cat": "Bebida", "kcal": 231, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 dose 50ml", "g": 50}]}, {"nome": "Whey protein concentrado", "cat": "Suplemento", "kcal": 400, "p": 80, "c": 10, "g": 6, "porcoes": [{"rotulo": "1 scoop 30g", "g": 30}]}, {"nome": "Whey protein isolado", "cat": "Suplemento", "kcal": 370, "p": 90, "c": 2, "g": 1, "porcoes": [{"rotulo": "1 scoop 30g", "g": 30}]}, {"nome": "Whisky/destilado puro", "cat": "Bebida", "kcal": 250, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 dose 50ml", "g": 50}]}, {"nome": "Whopper (Burger King)", "cat": "Fast Food", "kcal": 240, "p": 11, "c": 18, "g": 14, "porcoes": [{"rotulo": "1 unidade", "g": 270}]}, {"nome": "X-bacon", "cat": "Fast Food", "kcal": 320, "p": 16, "c": 22, "g": 19, "porcoes": [{"rotulo": "1 unidade", "g": 230}]}, {"nome": "X-salada (lanchonete)", "cat": "Fast Food", "kcal": 280, "p": 14, "c": 22, "g": 15, "porcoes": [{"rotulo": "1 unidade", "g": 200}]}, {"nome": "Yakisoba", "cat": "Preparo", "kcal": 130, "p": 7, "c": 18, "g": 3.5, "porcoes": [{"rotulo": "1 prato", "g": 300}]}, {"nome": "Água", "cat": "Bebida", "kcal": 0, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}, {"rotulo": "1 garrafa 500ml", "g": 500}]}, {"nome": "Água com gás", "cat": "Bebida", "kcal": 0, "p": 0, "c": 0, "g": 0, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Água de coco", "cat": "Bebida", "kcal": 20, "p": 0.7, "c": 4.5, "g": 0.1, "porcoes": [{"rotulo": "1 copo 200ml", "g": 200}]}, {"nome": "Óleo de coco", "cat": "Gordura", "kcal": 862, "p": 0, "c": 0, "g": 100, "porcoes": [{"rotulo": "1 colher sopa", "g": 13}]}, {"nome": "Óleo de soja", "cat": "Gordura", "kcal": 884, "p": 0, "c": 0, "g": 100, "porcoes": [{"rotulo": "1 colher sopa", "g": 13}]}];
// ============================ [PERFIL] ======================================
const PERFIL = { nome: "Matheus", altura_cm: 174, idade: 31, sexo: "M" };

/*
 * TMB — Taxa Metabólica Basal (fórmula Mifflin-St Jeor)
 * É quanto o corpo gasta em REPOUSO ABSOLUTO, só para existir. NÃO é a meta
 * de calorias do dia: você gasta muito mais que isso treinando e se movendo.
 * Calculada a partir do peso atual (passado como argumento).
 */
function calcularTMB(pesoKg) {
  // Homem: (10 × peso) + (6,25 × altura) − (5 × idade) + 5
  return Math.round(10 * pesoKg + 6.25 * PERFIL.altura_cm - 5 * PERFIL.idade + 5);
}
// TMB medida pela InBody mais recente (valor real do aparelho, fixo)
const TMB_INBODY = 1699;

// Macros de proteína/carbo/gordura (a meta de CALORIAS agora é editável e
// salva em dados.metaCalorias; estes ficam como referência fixa).
const META_MACROS = { calorias: 2250, proteina: 183, carbo: 235, gordura: 60 };

/*
 * LÍQUIDOS — quais alimentos são medidos em ml (não em gramas).
 * Usamos a categoria "Bebida" + os leites (que estão em "Laticínio"). Tratamos
 * 1 ml = 1 g para a contagem de calorias: a diferença real de densidade é de
 * 3-5%, irrelevante para o objetivo e padrão em apps de dieta. Iogurtes e whey
 * NÃO entram aqui de propósito — são consumidos por peso (pote, scoop).
 */
function ehLiquido(alimento) {
  if (alimento.cat === "Bebida") return true;
  if (/^leite/i.test(alimento.nome)) return true; // "Leite integral", "Leite desnatado"...
  return false;
}

/*
 * META DIÁRIA DE ÁGUA — calculada pelo PESO corporal (35 ml por kg), que é o
 * padrão fisiológico. Atenção: a "água corporal" da InBody (ex: 45,1L) mede a
 * água que já existe no corpo — NÃO é quanto se deve beber. São coisas
 * diferentes. Por isso usamos o peso, não o dado de água da bioimpedância.
 */
function calcularMetaAgua(pesoKg) {
  return Math.round(35 * pesoKg); // em ml
}

const REFEICOES_PLANO = [
  { id: "cafe", nome: "Café da manhã (7h40)", obs: "Antes do treino — protege o músculo" },
  { id: "pos", nome: "Pós-treino (~11h30)", obs: "Whey + banana, janela de absorção" },
  { id: "almoco", nome: "Almoço (~13h)", obs: "Arroz, feijão, frango, salada" },
  { id: "lanche", nome: "Lanche da tarde (15h30)", obs: "Iogurte + morango + whey" },
  { id: "jantar", nome: "Jantar (~20h)", obs: "Proteína + arroz + salada" },
];

const ATIVIDADES_MET = [
  { nome: "Musculação (intensa)", met: 6 },
  { nome: "Musculação (moderada)", met: 4.5 },
  { nome: "Boxe", met: 9 },
  { nome: "Corrida", met: 10 },
  { nome: "Bike", met: 8 },
  { nome: "Altinha/futevôlei", met: 7 },
];

// Paleta — painel de atleta, escuro com acento verde-limão
const ACCENT = "#D6FF3E", BG = "#0E1116", CARD = "#171B22", CARD2 = "#1E232C";
const BORDER = "#2A313C", TEXT = "#E8ECF1", MUTED = "#8A93A2";
const BLUE = "#5BC8FF", ORANGE = "#FFB85B", PINK = "#FF6B9D", RED = "#FF6B6B";

// ============================ [FORMULAS] ====================================
/*
 * NOTA DO FÍSICO (0-100) — bússola para SEU objetivo (perder gordura visceral,
 * preservar músculo). Pesos: %gordura 40, visceral 25, músculo 25, C/Q 10.
 * Ajuste os pesos se quiser. Serve para TENDÊNCIA, não medida absoluta.
 */
function calcularNota({ percGordura, gorduraVisceral, massaMuscular, peso, cinturaQuadril }) {
  let nota = 0;
  if (percGordura != null) nota += Math.max(0, 40 - Math.max(0, percGordura - 15) * 3);
  else nota += 20;
  if (gorduraVisceral != null) nota += Math.max(0, 25 - Math.max(0, gorduraVisceral - 7) * 5);
  else nota += 12;
  if (massaMuscular != null && peso) {
    const ratio = massaMuscular / peso;
    nota += Math.min(25, Math.max(0, (ratio - 0.30) / 0.15 * 25));
  } else nota += 12;
  if (cinturaQuadril != null) nota += Math.max(0, 10 - Math.max(0, cinturaQuadril - 0.90) * 50);
  else nota += 5;
  return Math.round(Math.min(100, Math.max(0, nota)));
}

// Calorias de treino pelo método MET: kcal = MET × peso × horas
function calcularCaloriasTreino(met, pesoKg, duracaoMin) {
  return Math.round(met * pesoKg * (duracaoMin / 60));
}

/*
 * DOBRAS CUTÂNEAS — converte soma de dobras em % de gordura.
 * 3 dobras (Jackson&Pollock H: peitoral, abdominal, coxa)
 * 7 dobras (peitoral, axilar, tríceps, subescapular, abdominal, suprailíaca, coxa)
 * Densidade -> Siri: %G = 495/densidade - 450
 */
function gorduraPor3Dobras(soma, idade) {
  const d = 1.10938 - 0.0008267 * soma + 0.0000016 * soma * soma - 0.0002574 * idade;
  return +(495 / d - 450).toFixed(1);
}
function gorduraPor7Dobras(soma, idade) {
  const d = 1.112 - 0.00043499 * soma + 0.00000055 * soma * soma - 0.00028826 * idade;
  return +(495 / d - 450).toFixed(1);
}

// ============================ [STORE] =======================================
const STORAGE_KEY = "fittracker_v2";

/*
 * DATA NO FUSO DE BRASÍLIA (UTC-3)
 * --------------------------------
 * Antes usávamos new Date().toISOString(), que converte para UTC. Como UTC
 * está 3h à frente de Brasília, o dia "virava" às 21h em vez da meia-noite.
 * Estas funções resolvem isso pegando a data já no fuso de São Paulo.
 *
 * dataBrasilia(d) recebe um objeto Date e devolve a string "AAAA-MM-DD"
 * correspondente ao dia daquele instante no horário de Brasília.
 */
function dataBrasilia(dateObj) {
  // en-CA produz o formato AAAA-MM-DD; o timeZone faz o ajuste do fuso
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric", month: "2-digit", day: "2-digit",
  }).format(dateObj);
}
const hoje = () => dataBrasilia(new Date());
const fmtData = (d) => d.split("-").reverse().join("/");

// Soma/subtrai dias a uma data "AAAA-MM-DD" sem cair em armadilha de fuso.
// Trabalha com a data ao meio-dia para nunca cruzar a virada do dia por engano.
function somarDias(dataStr, n) {
  const [a, m, d] = dataStr.split("-").map(Number);
  const dt = new Date(a, m - 1, d, 12, 0, 0); // meio-dia local, seguro
  dt.setDate(dt.getDate() + n);
  const ano = dt.getFullYear();
  const mes = String(dt.getMonth() + 1).padStart(2, "0");
  const dia = String(dt.getDate()).padStart(2, "0");
  return ano + "-" + mes + "-" + dia;
}

function carregarDados() {
  try { const r = localStorage.getItem(STORAGE_KEY); if (r) return JSON.parse(r); }
  catch (e) { console.warn("localStorage indisponível (normal no chat):", e); }
  return null;
}
function salvarDados(d) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }
  catch (e) { console.warn("Não foi possível salvar (sandbox do chat):", e); }
}

const ESTADO_INICIAL = {
  diario: {},
  refeicoesSalvas: [],
  alimentosCustom: [],
  metaCalorias: TMB_INBODY, // padrão = TMB da InBody (editável na aba Medidas)
  metaAgua: null, // ml/dia; null = calcula automático pelo peso (35 ml/kg)
  aguaPorDia: {}, // { "2026-06-25": 1500 } — ml de água bebidos em cada dia
  medidas: [
    { data: "2026-06-15", tipo: "inbody", peso: 83.4, percGordura: 26.2, massaMuscular: 35.1, gorduraVisceral: 9, cinturaQuadril: 0.92, agua: 45.1 },
  ],
  fichas: [
    { id: "A", nome: "Treino A — Peito / Tríceps / Ombro", exercicios: [
      { nome: "Supino reto", series: 4, repsAlvo: 8 },
      { nome: "Supino inclinado halter", series: 3, repsAlvo: 10 },
      { nome: "Crucifixo", series: 3, repsAlvo: 12 },
      { nome: "Desenvolvimento ombro", series: 4, repsAlvo: 10 },
      { nome: "Tríceps corda", series: 4, repsAlvo: 12 },
    ]},
    { id: "B", nome: "Treino B — Costas / Bíceps", exercicios: [
      { nome: "Puxada frente", series: 4, repsAlvo: 10 },
      { nome: "Remada curvada", series: 4, repsAlvo: 8 },
      { nome: "Remada baixa", series: 3, repsAlvo: 12 },
      { nome: "Rosca direta", series: 4, repsAlvo: 10 },
    ]},
    { id: "C", nome: "Treino C — Pernas", exercicios: [
      { nome: "Agachamento", series: 4, repsAlvo: 8 },
      { nome: "Leg press", series: 4, repsAlvo: 12 },
      { nome: "Cadeira extensora", series: 3, repsAlvo: 15 },
      { nome: "Mesa flexora", series: 3, repsAlvo: 12 },
      { nome: "Panturrilha", series: 4, repsAlvo: 20 },
    ]},
  ],
  historicoTreinos: [],
};

// ============================ ESTILOS =======================================
const inputStyle = { width: "100%", padding: "10px 12px", background: CARD2, border: "1px solid " + BORDER, borderRadius: 10, color: TEXT, fontSize: 14, boxSizing: "border-box", outline: "none" };
const inputSm = { width: "100%", padding: "8px 10px", background: BG, border: "1px solid " + BORDER, borderRadius: 8, color: TEXT, fontSize: 14, boxSizing: "border-box", outline: "none", textAlign: "center" };
const btnPrimary = { width: "100%", padding: 12, background: ACCENT, border: "none", borderRadius: 10, color: BG, fontWeight: 800, fontSize: 14, cursor: "pointer" };
const btnPrimarySm = { padding: "8px 18px", background: ACCENT, border: "none", borderRadius: 8, color: BG, fontWeight: 800, fontSize: 13, cursor: "pointer" };
const btnSec = { padding: "12px 18px", background: CARD2, border: "1px solid " + BORDER, borderRadius: 10, color: TEXT, fontWeight: 700, fontSize: 14, cursor: "pointer" };
const btnGhost = { padding: "8px 12px", background: "transparent", border: "1px solid " + BORDER, borderRadius: 8, color: MUTED, fontWeight: 600, fontSize: 12, cursor: "pointer" };
const card = { background: CARD, border: "1px solid " + BORDER, borderRadius: 16, padding: 18, marginBottom: 16 };
const cardTitle = { fontSize: 13, color: MUTED, marginBottom: 12, fontWeight: 600, letterSpacing: 0.5 };

function Stat({ label, value, sub, accent }) {
  return (
    <div style={{ background: CARD2, border: "1px solid " + BORDER, borderRadius: 12, padding: "14px 16px" }}>
      <div style={{ fontSize: 11, letterSpacing: 1, color: MUTED, textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || TEXT, fontFamily: "'DM Mono', monospace", lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function Barra({ atual, meta, label, cor }) {
  const pct = meta > 0 ? Math.min(100, Math.round((atual / meta) * 100)) : 0;
  const excedeu = atual > meta;
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 5 }}>
        <span style={{ color: TEXT, fontWeight: 600 }}>{label}</span>
        <span style={{ color: excedeu ? RED : MUTED, fontFamily: "'DM Mono', monospace" }}>{Math.round(atual)} / {meta}</span>
      </div>
      <div style={{ height: 8, background: CARD2, borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: pct + "%", height: "100%", background: excedeu ? RED : cor, borderRadius: 99, transition: "width .3s" }} />
      </div>
    </div>
  );
}

// Mini gráfico SVG reutilizável
function MiniGrafico({ pontos, cor, label, valorAtual }) {
  if (!pontos || pontos.length < 1) return null;
  const min = Math.min(...pontos), max = Math.max(...pontos), range = max - min || 1;
  const W = 280, H = 60, pad = 8;
  const coords = pontos.map((v, i) => ({
    x: pad + (i / Math.max(1, pontos.length - 1)) * (W - pad * 2),
    y: H - pad - ((v - min) / range) * (H - pad * 2),
  }));
  const path = coords.map((c, i) => (i === 0 ? "M" : "L") + c.x.toFixed(1) + " " + c.y.toFixed(1)).join(" ");
  return (
    <div style={{ background: CARD2, border: "1px solid " + BORDER, borderRadius: 12, padding: 14, marginBottom: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
        <span style={{ fontSize: 12, color: MUTED, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 14, color: cor, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{valorAtual}</span>
      </div>
      <svg width="100%" viewBox={"0 0 " + W + " " + H} preserveAspectRatio="none" style={{ display: "block" }}>
        <path d={path} fill="none" stroke={cor} strokeWidth="2" />
        {coords.map((c, i) => <circle key={i} cx={c.x} cy={c.y} r="2.5" fill={cor} />)}
      </svg>
    </div>
  );
}

// ============================ [UI-HOJE] =====================================
function AbaHoje({ dados, setDados, pesoAtual }) {
  // Data selecionada — começa em hoje, mas o usuário pode navegar para dias anteriores
  const [d, setD] = useState(hoje());
  const diaAtual = dados.diario[d] || { itens: [], refeicoesFeitas: {} };
  const ehHoje = d === hoje();
  // Meta de calorias efetiva (editável e salva; cai para TMB se não definida)
  const metaCal = dados.metaCalorias || TMB_INBODY;

  // --- ÁGUA ---
  // Meta: usa a manual (se definida) ou calcula 35 ml/kg do peso atual
  const metaAgua = dados.metaAgua || calcularMetaAgua(pesoAtual);
  // Quanto já bebeu no dia selecionado
  const aguaHoje = (dados.aguaPorDia && dados.aguaPorDia[d]) || 0;
  function addAgua(ml) {
    const novo = Math.max(0, aguaHoje + ml); // nunca abaixo de zero
    setDados({ ...dados, aguaPorDia: { ...dados.aguaPorDia, [d]: novo } });
  }
  function zerarAgua() {
    setDados({ ...dados, aguaPorDia: { ...dados.aguaPorDia, [d]: 0 } });
  }

  // Base completa = base fixa + alimentos custom do usuário
  const baseCompleta = useMemo(
    () => [...ALIMENTOS_BASE, ...dados.alimentosCustom].sort((a, b) => a.nome.localeCompare(b.nome, "pt")),
    [dados.alimentosCustom]
  );

  const [busca, setBusca] = useState("");
  const [refeicaoSel, setRefeicaoSel] = useState("cafe");
  const [selecionado, setSelecionado] = useState(null); // alimento escolhido
  const [modoQtd, setModoQtd] = useState("gramas"); // "gramas" | "porcao"
  const [gramas, setGramas] = useState(100);
  const [porcaoIdx, setPorcaoIdx] = useState(0);
  const [qtdPorcao, setQtdPorcao] = useState(1);

  // Modais
  const [showCustom, setShowCustom] = useState(false);
  const [showIA, setShowIA] = useState(false);
  const [showSalvarRef, setShowSalvarRef] = useState(false);

  const filtrados = useMemo(() => {
    if (!busca.trim()) return baseCompleta.slice(0, 30);
    const q = busca.toLowerCase();
    return baseCompleta.filter((a) => a.nome.toLowerCase().includes(q) || a.cat.toLowerCase().includes(q)).slice(0, 40);
  }, [busca, baseCompleta]);

  const totais = useMemo(() =>
    diaAtual.itens.reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, g: a.g + it.g }), { kcal: 0, p: 0, c: 0, g: 0 }),
    [diaAtual.itens]
  );

  // Calcula macros do item conforme modo e quantidade
  function calcularItem(alimento) {
    let fator;
    if (modoQtd === "gramas") fator = gramas / 100;
    else {
      const porc = alimento.porcoes[porcaoIdx];
      fator = (porc.g * qtdPorcao) / 100;
    }
    return {
      kcal: Math.round(alimento.kcal * fator),
      p: +(alimento.p * fator).toFixed(1),
      c: +(alimento.c * fator).toFixed(1),
      g: +(alimento.g * fator).toFixed(1),
    };
  }

  function addItem() {
    if (!selecionado) return;
    const m = calcularItem(selecionado);
    const unidade = ehLiquido(selecionado) ? "ml" : "g";
    const desc = modoQtd === "gramas" ? gramas + unidade : (qtdPorcao + "× " + selecionado.porcoes[porcaoIdx].rotulo);
    const item = { id: Date.now(), alimento: selecionado.nome, desc, refeicao: refeicaoSel, ...m };
    const novoDia = { ...diaAtual, itens: [...diaAtual.itens, item] };
    setDados({ ...dados, diario: { ...dados.diario, [d]: novoDia } });
    setSelecionado(null); setBusca(""); setGramas(100); setQtdPorcao(1); setPorcaoIdx(0);
  }

  function removerItem(id) {
    const novoDia = { ...diaAtual, itens: diaAtual.itens.filter((it) => it.id !== id) };
    setDados({ ...dados, diario: { ...dados.diario, [d]: novoDia } });
  }

  function toggleRefeicao(id) {
    const feitas = { ...diaAtual.refeicoesFeitas, [id]: !diaAtual.refeicoesFeitas[id] };
    setDados({ ...dados, diario: { ...dados.diario, [d]: { ...diaAtual, refeicoesFeitas: feitas } } });
  }

  // Carregar uma refeição salva = adiciona todos os itens dela ao dia
  function carregarRefeicaoSalva(ref) {
    const novos = ref.itens.map((it) => ({ ...it, id: Date.now() + Math.random(), refeicao: refeicaoSel }));
    const novoDia = { ...diaAtual, itens: [...diaAtual.itens, ...novos] };
    setDados({ ...dados, diario: { ...dados.diario, [d]: novoDia } });
  }

  return (
    <div>
      {/* SELETOR DE DATA — setas para dia anterior/próximo + calendário */}
      <div style={{ ...card, padding: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <button
          onClick={() => setD(somarDias(d, -1))}
          style={{ ...btnSec, padding: "10px 14px", fontSize: 18 }}
          aria-label="Dia anterior"
        >‹</button>

        <div style={{ flex: 1, textAlign: "center", position: "relative" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: ehHoje ? ACCENT : TEXT }}>
            {ehHoje ? "Hoje" : fmtData(d)}
          </div>
          <div style={{ fontSize: 11, color: MUTED }}>{ehHoje ? fmtData(d) : "dia anterior"}</div>
          {/* input de data invisível por cima, abre o calendário nativo ao tocar */}
          <input
            type="date"
            value={d}
            max={hoje()}
            onChange={(e) => { if (e.target.value) setD(e.target.value); }}
            style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer", border: "none" }}
            aria-label="Escolher data no calendário"
          />
        </div>

        <button
          onClick={() => { if (!ehHoje) setD(somarDias(d, 1)); }}
          disabled={ehHoje}
          style={{ ...btnSec, padding: "10px 14px", fontSize: 18, opacity: ehHoje ? 0.35 : 1, cursor: ehHoje ? "default" : "pointer" }}
          aria-label="Próximo dia"
        >›</button>
      </div>

      {/* Botão para voltar rápido ao hoje, só aparece quando está num dia passado */}
      {!ehHoje && (
        <button onClick={() => setD(hoje())} style={{ ...btnGhost, width: "100%", marginTop: -8, marginBottom: 16, color: ACCENT, borderColor: ACCENT }}>
          ↩ Voltar para hoje
        </button>
      )}

      {/* RESUMO */}
      <div style={card}>
        <div style={cardTitle}>{ehHoje ? "RESUMO DE HOJE" : "RESUMO DO DIA"}</div>
        <Barra atual={totais.kcal} meta={metaCal} label="Calorias (kcal)" cor={ACCENT} />
        <Barra atual={totais.p} meta={META_MACROS.proteina} label="Proteína (g)" cor={BLUE} />
        <Barra atual={totais.c} meta={META_MACROS.carbo} label="Carboidrato (g)" cor={ORANGE} />
        <Barra atual={totais.g} meta={META_MACROS.gordura} label="Gordura (g)" cor={PINK} />
      </div>

      {/* ÁGUA */}
      <SecaoAgua
        aguaHoje={aguaHoje}
        metaAgua={metaAgua}
        metaManual={dados.metaAgua}
        addAgua={addAgua}
        zerarAgua={zerarAgua}
        onSalvarMeta={(v) => setDados({ ...dados, metaAgua: v })}
        pesoAtual={pesoAtual}
      />

      {/* CHECKLIST REFEIÇÕES */}
      <div style={card}>
        <div style={cardTitle}>REFEIÇÕES DO PLANO</div>
        {REFEICOES_PLANO.map((r) => {
          const feita = diaAtual.refeicoesFeitas[r.id];
          return (
            <div key={r.id} onClick={() => toggleRefeicao(r.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", cursor: "pointer", borderBottom: "1px solid " + BORDER }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, border: "2px solid " + (feita ? ACCENT : BORDER), background: feita ? ACCENT : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {feita && <span style={{ color: BG, fontWeight: 900, fontSize: 14 }}>✓</span>}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ color: feita ? MUTED : TEXT, fontWeight: 600, fontSize: 14, textDecoration: feita ? "line-through" : "none" }}>{r.nome}</div>
                <div style={{ color: MUTED, fontSize: 12 }}>{r.obs}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* IA: ME CONTE O QUE COMEU */}
      <div style={card}>
        <div style={cardTitle}>🤖 ME CONTE O QUE VOCÊ COMEU HOJE</div>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
          Para dias sem pesar nada: descreva suas refeições e a IA estima calorias e macros.
        </div>
        <button onClick={() => setShowIA(true)} style={btnSec}>Abrir estimativa por IA</button>
      </div>

      {/* REGISTRAR ALIMENTO COM BUSCA */}
      <div style={card}>
        <div style={cardTitle}>REGISTRAR ALIMENTO</div>

        {/* refeição alvo + refeições salvas */}
        <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
          <select value={refeicaoSel} onChange={(e) => setRefeicaoSel(e.target.value)} style={{ ...inputStyle, flex: 1 }}>
            {REFEICOES_PLANO.map((r) => <option key={r.id} value={r.id}>{r.nome}</option>)}
          </select>
        </div>

        {dados.refeicoesSalvas.length > 0 && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 6 }}>Refeições salvas (toque para adicionar):</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {dados.refeicoesSalvas.map((ref, i) => (
                <button key={i} onClick={() => carregarRefeicaoSalva(ref)} style={{ ...btnGhost, color: ACCENT, borderColor: ACCENT }}>
                  + {ref.nome}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* busca */}
        <input value={busca} onChange={(e) => { setBusca(e.target.value); setSelecionado(null); }} placeholder="🔍 Buscar alimento ou bebida..." style={{ ...inputStyle, marginBottom: 8 }} />

        {/* lista de resultados */}
        {!selecionado && (
          <div style={{ maxHeight: 220, overflowY: "auto", border: "1px solid " + BORDER, borderRadius: 10, marginBottom: 10 }}>
            {filtrados.map((a) => (
              <div key={a.nome} onClick={() => { setSelecionado(a); setModoQtd(a.porcoes.length ? "porcao" : "gramas"); setPorcaoIdx(0); }} style={{ padding: "10px 12px", borderBottom: "1px solid " + BORDER, cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: TEXT, fontSize: 14 }}>{a.nome}</span>
                <span style={{ color: MUTED, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{a.kcal} kcal/100{ehLiquido(a) ? "ml" : "g"}</span>
              </div>
            ))}
            {/* opção de adicionar novo alimento ao fim da lista */}
            <div onClick={() => setShowCustom(true)} style={{ padding: "12px", cursor: "pointer", textAlign: "center", color: ACCENT, fontWeight: 700, fontSize: 13 }}>
              + Adicionar novo alimento
            </div>
          </div>
        )}

        {/* alimento selecionado: escolher gramas OU porção */}
        {selecionado && (
          <div style={{ background: CARD2, border: "1px solid " + ACCENT, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ color: TEXT, fontWeight: 700, fontSize: 15 }}>{selecionado.nome}</span>
              <button onClick={() => setSelecionado(null)} style={{ background: "none", border: "none", color: MUTED, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>

            {/* toggle gramas/porção só se houver porções */}
            {selecionado.porcoes.length > 0 && (
              <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
                <button onClick={() => setModoQtd("gramas")} style={modoQtd === "gramas" ? toggleOn : toggleOff}>{ehLiquido(selecionado) ? "Mililitros" : "Gramas"}</button>
                <button onClick={() => setModoQtd("porcao")} style={modoQtd === "porcao" ? toggleOn : toggleOff}>Porção</button>
              </div>
            )}

            {modoQtd === "gramas" ? (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <input type="number" min="1" value={gramas} onChange={(e) => setGramas(+e.target.value)} style={{ ...inputSm, width: 100 }} />
                <span style={{ color: MUTED, fontSize: 14 }}>{ehLiquido(selecionado) ? "mililitros" : "gramas"}</span>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8 }}>
                <input type="number" min="0.5" step="0.5" value={qtdPorcao} onChange={(e) => setQtdPorcao(+e.target.value)} style={{ ...inputSm, width: 70 }} />
                <select value={porcaoIdx} onChange={(e) => setPorcaoIdx(+e.target.value)} style={{ ...inputSm, flex: 1 }}>
                  {selecionado.porcoes.map((p, i) => <option key={i} value={i}>{p.rotulo} ({p.g}g)</option>)}
                </select>
              </div>
            )}

            {/* preview dos macros */}
            {(() => { const m = calcularItem(selecionado); return (
              <div style={{ marginTop: 10, fontSize: 13, color: ACCENT, fontFamily: "'DM Mono', monospace" }}>
                = {m.kcal} kcal · P{m.p} C{m.c} G{m.g}
              </div>
            ); })()}

            <button onClick={addItem} style={{ ...btnPrimary, marginTop: 12 }}>Adicionar ao diário</button>
          </div>
        )}
      </div>

      {/* CONSUMIDO HOJE */}
      {diaAtual.itens.length > 0 && (
        <div style={card}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={cardTitle}>CONSUMIDO HOJE</span>
            <button onClick={() => setShowSalvarRef(true)} style={btnGhost}>Salvar como refeição</button>
          </div>
          {diaAtual.itens.map((it) => (
            <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid " + BORDER }}>
              <div>
                <div style={{ color: TEXT, fontSize: 14 }}>{it.alimento} <span style={{ color: MUTED, fontSize: 12 }}>{it.desc}</span></div>
                <div style={{ color: MUTED, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>{it.kcal} kcal · P{it.p} C{it.c} G{it.g}</div>
              </div>
              <button onClick={() => removerItem(it.id)} style={{ background: "none", border: "none", color: RED, cursor: "pointer", fontSize: 18 }}>×</button>
            </div>
          ))}
        </div>
      )}

      {showCustom && <ModalCustom dados={dados} setDados={setDados} onClose={() => setShowCustom(false)} />}
      {showIA && <ModalIA onClose={() => setShowIA(false)} />}
      {showSalvarRef && <ModalSalvarRef itens={diaAtual.itens} dados={dados} setDados={setDados} onClose={() => setShowSalvarRef(false)} />}
    </div>
  );
}

const toggleOn = { flex: 1, padding: 8, background: ACCENT, border: "none", borderRadius: 8, color: BG, fontWeight: 700, fontSize: 13, cursor: "pointer" };
const toggleOff = { flex: 1, padding: 8, background: BG, border: "1px solid " + BORDER, borderRadius: 8, color: MUTED, fontWeight: 700, fontSize: 13, cursor: "pointer" };

/*
 * SEÇÃO DE ÁGUA — registro do dia com botões rápidos + campo manual, barra de
 * progresso e meta editável (padrão 35 ml/kg do peso).
 */
function SecaoAgua({ aguaHoje, metaAgua, metaManual, addAgua, zerarAgua, onSalvarMeta, pesoAtual }) {
  const [manual, setManual] = useState("");
  const [editandoMeta, setEditandoMeta] = useState(false);
  const [metaInput, setMetaInput] = useState(String(metaAgua));

  const pct = metaAgua > 0 ? Math.min(100, Math.round((aguaHoje / metaAgua) * 100)) : 0;
  const litros = (ml) => (ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1).replace(".", ",");
  const bateu = aguaHoje >= metaAgua;

  function adicionarManual() {
    const v = parseInt(manual, 10);
    if (!v || v <= 0) return;
    addAgua(v);
    setManual("");
  }
  function salvarMeta() {
    const v = parseInt(metaInput, 10);
    if (!v || v < 500) { alert("Informe uma meta válida (mínimo 500 ml)."); return; }
    onSalvarMeta(v);
    setEditandoMeta(false);
  }

  return (
    <div style={card}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={cardTitle}>💧 ÁGUA</span>
        <button onClick={() => { setMetaInput(String(metaAgua)); setEditandoMeta(!editandoMeta); }} style={btnGhost}>
          {editandoMeta ? "Fechar" : "Ajustar meta"}
        </button>
      </div>

      {/* Progresso */}
      <div style={{ textAlign: "center", marginBottom: 14 }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: bateu ? ACCENT : BLUE, fontFamily: "'DM Mono', monospace", lineHeight: 1 }}>
          {litros(aguaHoje)}<span style={{ fontSize: 18, color: MUTED }}> / {litros(metaAgua)} L</span>
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>
          {bateu ? "✓ meta batida!" : (metaAgua - aguaHoje) + " ml restantes"}
        </div>
      </div>

      {/* Barra de progresso */}
      <div style={{ height: 10, background: CARD2, borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: pct + "%", height: "100%", background: bateu ? ACCENT : BLUE, borderRadius: 99, transition: "width .3s" }} />
      </div>

      {/* Botões rápidos */}
      <div style={{ display: "flex", gap: 8, marginBottom: 10 }}>
        {[["+250", 250], ["+500", 500], ["+1L", 1000]].map(([rotulo, ml]) => (
          <button key={ml} onClick={() => addAgua(ml)} style={{ flex: 1, padding: "12px 0", background: CARD2, border: "1px solid " + BLUE, borderRadius: 10, color: BLUE, fontWeight: 800, fontSize: 14, cursor: "pointer" }}>
            {rotulo}
          </button>
        ))}
      </div>

      {/* Campo manual + desfazer */}
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <input type="number" min="1" placeholder="ml" value={manual} onChange={(e) => setManual(e.target.value)} style={{ ...inputSm, flex: 1 }} />
        <button onClick={adicionarManual} style={btnPrimarySm}>Adicionar</button>
        {aguaHoje > 0 && (
          <button onClick={() => addAgua(-250)} style={btnGhost} aria-label="Desfazer 250ml">−250</button>
        )}
      </div>

      {aguaHoje > 0 && (
        <button onClick={zerarAgua} style={{ ...btnGhost, width: "100%", marginTop: 8 }}>Zerar o dia</button>
      )}

      {/* Editor de meta */}
      {editandoMeta && (
        <div style={{ background: CARD2, border: "1px solid " + BORDER, borderRadius: 10, padding: 12, marginTop: 12 }}>
          <label style={lbl}>Meta diária de água (ml)</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="number" value={metaInput} onChange={(e) => setMetaInput(e.target.value)} style={{ ...inputSm, flex: 1 }} />
            <button onClick={salvarMeta} style={btnPrimarySm}>Salvar</button>
            {metaManual && (
              <button onClick={() => { onSalvarMeta(null); setEditandoMeta(false); }} style={btnGhost}>Auto</button>
            )}
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 8, lineHeight: 1.5 }}>
            Sugestão automática: {calcularMetaAgua(pesoAtual)} ml (35 ml por kg do seu peso de {pesoAtual} kg). A água da bioimpedância mede a água que já está no corpo, então não serve para definir quanto beber — por isso usamos o peso.
            {metaManual ? " Você está usando uma meta manual; toque em \"Auto\" para voltar ao cálculo." : ""}
          </div>
        </div>
      )}
    </div>
  );
}

// Modal: adicionar alimento custom
function ModalCustom({ dados, setDados, onClose }) {
  const [f, setF] = useState({ nome: "", kcal: "", p: "", c: "", g: "" });
  function salvar() {
    if (!f.nome || !f.kcal) { alert("Informe ao menos nome e calorias (por 100g)."); return; }
    const novo = { nome: f.nome, cat: "Custom", kcal: +f.kcal, p: +(f.p || 0), c: +(f.c || 0), g: +(f.g || 0), porcoes: [] };
    setDados({ ...dados, alimentosCustom: [...dados.alimentosCustom, novo] });
    onClose();
  }
  return (
    <Modal titulo="Novo alimento" onClose={onClose}>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Valores por 100g/100ml.</div>
      <input placeholder="Nome do alimento" value={f.nome} onChange={(e) => setF({ ...f, nome: e.target.value })} style={{ ...inputStyle, marginBottom: 10 }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 12 }}>
        <div><label style={lbl}>Calorias</label><input type="number" value={f.kcal} onChange={(e) => setF({ ...f, kcal: e.target.value })} style={inputStyle} /></div>
        <div><label style={lbl}>Proteína (g)</label><input type="number" value={f.p} onChange={(e) => setF({ ...f, p: e.target.value })} style={inputStyle} /></div>
        <div><label style={lbl}>Carboidrato (g)</label><input type="number" value={f.c} onChange={(e) => setF({ ...f, c: e.target.value })} style={inputStyle} /></div>
        <div><label style={lbl}>Gordura (g)</label><input type="number" value={f.g} onChange={(e) => setF({ ...f, g: e.target.value })} style={inputStyle} /></div>
      </div>
      <button onClick={salvar} style={btnPrimary}>Salvar alimento</button>
    </Modal>
  );
}

// Modal: IA simulada (placeholder com instrução de ativação)
function ModalIA({ onClose }) {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState(null);
  function estimar() {
    // SIMULADO — quando a Netlify Function estiver pronta, troque por fetch real.
    setResultado("simulado");
  }
  return (
    <Modal titulo="🤖 Estimativa por IA" onClose={onClose}>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
        Descreva tudo que comeu e bebeu hoje. Ex: "no café 2 pães com ovo e um copo de leite, no almoço um prato de arroz, feijão, bife e salada..."
      </div>
      <textarea value={texto} onChange={(e) => setTexto(e.target.value)} rows={5} placeholder="Conte aqui o que você comeu..." style={{ ...inputStyle, resize: "vertical", marginBottom: 12 }} />
      <button onClick={estimar} style={btnPrimary}>Estimar calorias e macros</button>
      {resultado === "simulado" && (
        <div style={{ marginTop: 14, padding: 14, background: CARD2, border: "1px dashed " + ORANGE, borderRadius: 10 }}>
          <div style={{ color: ORANGE, fontWeight: 700, fontSize: 13, marginBottom: 6 }}>⚠ IA ainda não conectada</div>
          <div style={{ color: MUTED, fontSize: 13, lineHeight: 1.5 }}>
            Esta função precisa da Netlify Function com sua chave Gemini (instruções no guia que acompanha o app).
            Enquanto não publicada, ela fica desativada. O resto do app funciona normal.
          </div>
        </div>
      )}
    </Modal>
  );
}

// Modal: salvar refeição
function ModalSalvarRef({ itens, dados, setDados, onClose }) {
  const [nome, setNome] = useState("");
  function salvar() {
    if (!nome) { alert("Dê um nome para a refeição."); return; }
    const itensLimpos = itens.map(({ id, refeicao, ...rest }) => rest);
    setDados({ ...dados, refeicoesSalvas: [...dados.refeicoesSalvas, { nome, itens: itensLimpos }] });
    onClose();
  }
  return (
    <Modal titulo="Salvar refeição" onClose={onClose}>
      <div style={{ fontSize: 12, color: MUTED, marginBottom: 10 }}>
        Salva os {itens.length} itens de hoje como uma refeição reutilizável.
      </div>
      <input placeholder="Nome (ex: Meu café padrão)" value={nome} onChange={(e) => setNome(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
      <button onClick={salvar} style={btnPrimary}>Salvar</button>
    </Modal>
  );
}

function Modal({ titulo, children, onClose }) {
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "flex-end", justifyContent: "center", zIndex: 100 }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: CARD, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20, width: "100%", maxWidth: 480, maxHeight: "85vh", overflowY: "auto", border: "1px solid " + BORDER }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <span style={{ fontSize: 17, fontWeight: 800, color: TEXT }}>{titulo}</span>
          <button onClick={onClose} style={{ background: "none", border: "none", color: MUTED, fontSize: 24, cursor: "pointer" }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}
const lbl = { fontSize: 11, color: MUTED, display: "block", marginBottom: 4 };

// ============================ [UI-MED] ======================================
function AbaMedidas({ dados, setDados }) {
  const [tipoForm, setTipoForm] = useState("inbody"); // inbody | dobras3 | dobras7

  // Data da medição — começa em hoje, mas pode ser uma data passada (histórico)
  const [dataMedida, setDataMedida] = useState(hoje());

  const medidasOrd = useMemo(() => [...dados.medidas].sort((a, b) => a.data.localeCompare(b.data)), [dados.medidas]);
  const comNota = medidasOrd.map((m) => ({ ...m, nota: calcularNota(m) }));
  const ultima = comNota[comNota.length - 1];

  // Peso mais recente, para calcular a TMB pela fórmula
  const pesoAtual = useMemo(() => {
    const ms = [...dados.medidas].filter((m) => m.peso != null).sort((a, b) => b.data.localeCompare(a.data));
    return ms[0]?.peso || 83;
  }, [dados.medidas]);
  const tmbFormula = calcularTMB(pesoAtual);

  // Meta de calorias editável (salva em dados.metaCalorias)
  const metaCal = dados.metaCalorias || TMB_INBODY;
  const [metaInput, setMetaInput] = useState(String(metaCal));
  function salvarMeta() {
    const v = parseInt(metaInput, 10);
    if (!v || v < 800) { alert("Informe uma meta válida (mínimo 800 kcal)."); return; }
    setDados({ ...dados, metaCalorias: v });
    alert("Meta de calorias atualizada para " + v + " kcal.");
  }
  // Limiar de segurança: abaixo disso, mostramos aviso (não bloqueia)
  const metaAbaixoDoSeguro = metaCal < tmbFormula;

  // Avisa se já existe medida na data escolhida (será substituída ao salvar)
  const jaExisteNaData = dados.medidas.some((m) => m.data === dataMedida);

  // Remove uma medida específica (útil ao corrigir lançamentos de histórico)
  function removerMedida(data, tipo) {
    if (!confirm("Remover a medida de " + fmtData(data) + "?")) return;
    setDados({ ...dados, medidas: dados.medidas.filter((m) => !(m.data === data && m.tipo === tipo)) });
  }

  // ---- EDIÇÃO INLINE de uma medida existente ----
  // Guarda a chave (data+tipo) da medida aberta para edição, e um rascunho dos
  // campos enquanto o usuário digita. Salvar grava o rascunho de volta no array.
  const [editandoMedida, setEditandoMedida] = useState(null); // chave "data|tipo" ou null
  const [rascunho, setRascunho] = useState({}); // valores em edição

  function abrirEdicao(m) {
    setEditandoMedida(m.data + "|" + m.tipo);
    // Copia os valores atuais para o rascunho (como string, para os inputs)
    setRascunho({
      peso: m.peso ?? "",
      percGordura: m.percGordura ?? "",
      massaMuscular: m.massaMuscular ?? "",
      gorduraVisceral: m.gorduraVisceral ?? "",
      cinturaQuadril: m.cinturaQuadril ?? "",
      agua: m.agua ?? "",
    });
  }

  function salvarEdicao(mOriginal) {
    // Reconstrói a medida com os valores do rascunho (mantendo data, tipo e o
    // que não é editável aqui, como somaDobras). Campos vazios viram null.
    const num = (v) => (v === "" || v == null ? null : +v);
    const atualizada = {
      ...mOriginal,
      peso: num(rascunho.peso),
      percGordura: num(rascunho.percGordura),
      massaMuscular: num(rascunho.massaMuscular),
      gorduraVisceral: num(rascunho.gorduraVisceral),
      cinturaQuadril: num(rascunho.cinturaQuadril),
      agua: num(rascunho.agua),
    };
    setDados({
      ...dados,
      medidas: dados.medidas.map((x) =>
        x.data === mOriginal.data && x.tipo === mOriginal.tipo ? atualizada : x
      ),
    });
    setEditandoMedida(null);
    alert("Medida de " + fmtData(mOriginal.data) + " atualizada.");
  }

  // ---- formulário InBody ----
  const [inb, setInb] = useState({ peso: "", percGordura: "", massaMuscular: "", gorduraVisceral: "", cinturaQuadril: "", agua: "" });
  function salvarInbody() {
    if (!inb.peso) { alert("Peso é obrigatório."); return; }
    const nova = { data: dataMedida, tipo: "inbody", peso: +inb.peso,
      percGordura: inb.percGordura ? +inb.percGordura : null,
      massaMuscular: inb.massaMuscular ? +inb.massaMuscular : null,
      gorduraVisceral: inb.gorduraVisceral ? +inb.gorduraVisceral : null,
      cinturaQuadril: inb.cinturaQuadril ? +inb.cinturaQuadril : null,
      agua: inb.agua ? +inb.agua : null };
    setDados({ ...dados, medidas: [...dados.medidas.filter((m) => m.data !== nova.data), nova] });
    setInb({ peso: "", percGordura: "", massaMuscular: "", gorduraVisceral: "", cinturaQuadril: "", agua: "" });
    alert("Medida InBody salva em " + fmtData(dataMedida) + ".");
  }

  // ---- formulário dobras 3 ----
  const [d3, setD3] = useState({ peso: "", peitoral: "", abdominal: "", coxa: "" });
  function salvarDobras3() {
    const { peitoral, abdominal, coxa } = d3;
    if (!peitoral || !abdominal || !coxa) { alert("Preencha as 3 dobras."); return; }
    const soma = +peitoral + +abdominal + +coxa;
    const pg = gorduraPor3Dobras(soma, PERFIL.idade);
    const nova = { data: dataMedida, tipo: "dobras3", peso: d3.peso ? +d3.peso : null, percGordura: pg, somaDobras: soma, gorduraVisceral: null, massaMuscular: null, cinturaQuadril: null };
    setDados({ ...dados, medidas: [...dados.medidas.filter((m) => m.data !== nova.data), nova] });
    setD3({ peso: "", peitoral: "", abdominal: "", coxa: "" });
    alert("Medida de 3 dobras salva em " + fmtData(dataMedida) + ". Gordura estimada: " + pg + "%.");
  }

  // ---- formulário dobras 7 ----
  const campos7 = [["peitoral", "Peitoral"], ["axilar", "Axilar média"], ["triceps", "Tríceps"], ["subescapular", "Subescapular"], ["abdominal", "Abdominal"], ["suprailiaca", "Supra-ilíaca"], ["coxa", "Coxa"]];
  const [d7, setD7] = useState({ peso: "" });
  function salvarDobras7() {
    const vals = campos7.map(([k]) => d7[k]);
    if (vals.some((v) => !v)) { alert("Preencha as 7 dobras."); return; }
    const soma = vals.reduce((a, v) => a + +v, 0);
    const pg = gorduraPor7Dobras(soma, PERFIL.idade);
    const nova = { data: dataMedida, tipo: "dobras7", peso: d7.peso ? +d7.peso : null, percGordura: pg, somaDobras: soma, gorduraVisceral: null, massaMuscular: null, cinturaQuadril: null };
    setDados({ ...dados, medidas: [...dados.medidas.filter((m) => m.data !== nova.data), nova] });
    setD7({ peso: "" });
    alert("Medida de 7 dobras salva em " + fmtData(dataMedida) + ". Gordura estimada: " + pg + "%.");
  }

  const serie = (campo) => comNota.filter((m) => m[campo] != null).map((m) => m[campo]);

  return (
    <div>
      {/* TMB E META DE CALORIAS */}
      <div style={card}>
        <div style={cardTitle}>METABOLISMO E META</div>

        {/* TMB: os dois valores, com explicação */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div style={{ background: CARD2, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: MUTED }}>TMB (fórmula)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, fontFamily: "'DM Mono', monospace" }}>{tmbFormula}</div>
            <div style={{ fontSize: 10, color: MUTED }}>kcal · do seu peso atual</div>
          </div>
          <div style={{ background: CARD2, borderRadius: 10, padding: "12px 14px" }}>
            <div style={{ fontSize: 11, color: MUTED }}>TMB (InBody)</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: TEXT, fontFamily: "'DM Mono', monospace" }}>{TMB_INBODY}</div>
            <div style={{ fontSize: 10, color: MUTED }}>kcal · medida real</div>
          </div>
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginBottom: 16, lineHeight: 1.5 }}>
          A TMB é o gasto do corpo em repouso absoluto — não inclui treinos nem o dia a dia. Por isso ela costuma ser bem menor que o gasto total.
        </div>

        {/* Meta de calorias editável */}
        <label style={lbl}>Meta de calorias do dia</label>
        <div style={{ display: "flex", gap: 8 }}>
          <input type="number" value={metaInput} onChange={(e) => setMetaInput(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
          <button onClick={salvarMeta} style={btnPrimarySm}>Salvar</button>
        </div>

        {/* Aviso de segurança quando a meta está abaixo da TMB */}
        {metaAbaixoDoSeguro && (
          <div style={{ marginTop: 12, padding: 12, background: CARD2, border: "1px solid " + ORANGE, borderRadius: 10 }}>
            <div style={{ color: ORANGE, fontWeight: 700, fontSize: 12, marginBottom: 4 }}>⚠ Meta abaixo da sua TMB</div>
            <div style={{ color: MUTED, fontSize: 12, lineHeight: 1.5 }}>
              Comer menos que o gasto em repouso, com o volume de treino que você faz, gera um déficit grande e acelera a perda de músculo. Funciona para perder peso rápido, mas vigie sua massa magra nas próximas medições.
            </div>
          </div>
        )}
      </div>

      {ultima && (
        <div style={{ background: "linear-gradient(135deg," + CARD + "," + CARD2 + ")", border: "1px solid " + BORDER, borderRadius: 16, padding: 22, marginBottom: 16, textAlign: "center" }}>
          <div style={{ fontSize: 12, letterSpacing: 1.5, color: MUTED, textTransform: "uppercase", fontWeight: 700 }}>Nota do físico</div>
          <div style={{ fontSize: 64, fontWeight: 900, color: ACCENT, fontFamily: "'DM Mono', monospace", lineHeight: 1, margin: "6px 0" }}>{ultima.nota}</div>
          <div style={{ fontSize: 13, color: MUTED }}>de 100 · {fmtData(ultima.data)} · {ultima.tipo === "inbody" ? "InBody" : ultima.tipo === "dobras3" ? "3 dobras" : "7 dobras"}</div>
        </div>
      )}

      {ultima && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
          <Stat label="Peso" value={ultima.peso != null ? ultima.peso + " kg" : "—"} />
          <Stat label="% Gordura" value={ultima.percGordura != null ? ultima.percGordura + "%" : "—"} accent={PINK} />
          <Stat label="Músculo" value={ultima.massaMuscular != null ? ultima.massaMuscular + " kg" : "—"} accent={BLUE} />
          <Stat label="Visceral" value={ultima.gorduraVisceral != null ? ultima.gorduraVisceral : "—"} sub={ultima.gorduraVisceral >= 9 ? "no limite!" : ""} accent={ultima.gorduraVisceral >= 9 ? RED : ACCENT} />
        </div>
      )}

      <div style={card}>
        <div style={cardTitle}>EVOLUÇÃO</div>
        <MiniGrafico pontos={serie("nota")} cor={ACCENT} label="Nota do físico" valorAtual={ultima ? ultima.nota : "—"} />
        <MiniGrafico pontos={serie("peso")} cor={TEXT} label="Peso (kg)" valorAtual={serie("peso").slice(-1)[0] || "—"} />
        <MiniGrafico pontos={serie("percGordura")} cor={PINK} label="% Gordura" valorAtual={serie("percGordura").slice(-1)[0] || "—"} />
        <MiniGrafico pontos={serie("massaMuscular")} cor={BLUE} label="Massa muscular (kg)" valorAtual={serie("massaMuscular").slice(-1)[0] || "—"} />
        <MiniGrafico pontos={serie("gorduraVisceral")} cor={ORANGE} label="Gordura visceral" valorAtual={serie("gorduraVisceral").slice(-1)[0] || "—"} />
      </div>

      <div style={card}>
        <div style={cardTitle}>NOVA MEDIDA</div>

        {/* Seletor de data da medição — permite lançar bioimpedâncias/dobras antigas */}
        <div style={{ marginBottom: 14 }}>
          <label style={lbl}>Data da medição</label>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <button onClick={() => setDataMedida(somarDias(dataMedida, -1))} style={{ ...btnSec, padding: "10px 14px", fontSize: 18 }} aria-label="Dia anterior">‹</button>
            <div style={{ flex: 1, textAlign: "center", position: "relative", background: CARD2, border: "1px solid " + BORDER, borderRadius: 10, padding: "10px 0" }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: dataMedida === hoje() ? ACCENT : TEXT }}>
                {dataMedida === hoje() ? "Hoje" : fmtData(dataMedida)}
              </span>
              <input type="date" value={dataMedida} max={hoje()} onChange={(e) => { if (e.target.value) setDataMedida(e.target.value); }}
                style={{ position: "absolute", inset: 0, opacity: 0, width: "100%", height: "100%", cursor: "pointer", border: "none" }} aria-label="Escolher data" />
            </div>
            <button onClick={() => { if (dataMedida !== hoje()) setDataMedida(somarDias(dataMedida, 1)); }} disabled={dataMedida === hoje()}
              style={{ ...btnSec, padding: "10px 14px", fontSize: 18, opacity: dataMedida === hoje() ? 0.35 : 1 }} aria-label="Próximo dia">›</button>
          </div>
          <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Toque no centro para abrir o calendário e lançar uma medida antiga.</div>
          {jaExisteNaData && (
            <div style={{ fontSize: 12, color: ORANGE, marginTop: 6 }}>
              ⚠ Já existe uma medida nesta data. Salvar vai substituí-la.
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
          <button onClick={() => setTipoForm("inbody")} style={tipoForm === "inbody" ? toggleOn : toggleOff}>InBody</button>
          <button onClick={() => setTipoForm("dobras3")} style={tipoForm === "dobras3" ? toggleOn : toggleOff}>3 dobras</button>
          <button onClick={() => setTipoForm("dobras7")} style={tipoForm === "dobras7" ? toggleOn : toggleOff}>7 dobras</button>
        </div>

        {tipoForm === "inbody" && (
          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Dados da bioimpedância. Só o peso é obrigatório.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[["peso", "Peso (kg)"], ["percGordura", "% Gordura"], ["massaMuscular", "Músculo esq. (kg)"], ["gorduraVisceral", "Gordura visceral"], ["cinturaQuadril", "Cintura/Quadril"], ["agua", "Água (L)"]].map(([k, l]) => (
                <div key={k}><label style={lbl}>{l}</label><input type="number" step="0.1" value={inb[k]} onChange={(e) => setInb({ ...inb, [k]: e.target.value })} style={inputStyle} /></div>
              ))}
            </div>
            <button onClick={salvarInbody} style={{ ...btnPrimary, marginTop: 14 }}>Salvar InBody</button>
          </div>
        )}

        {tipoForm === "dobras3" && (
          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Protocolo Jackson & Pollock 3 dobras (mm). O % de gordura é calculado automaticamente.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lbl}>Peso (kg)</label><input type="number" step="0.1" value={d3.peso} onChange={(e) => setD3({ ...d3, peso: e.target.value })} style={inputStyle} /></div>
              <div><label style={lbl}>Peitoral (mm)</label><input type="number" value={d3.peitoral} onChange={(e) => setD3({ ...d3, peitoral: e.target.value })} style={inputStyle} /></div>
              <div><label style={lbl}>Abdominal (mm)</label><input type="number" value={d3.abdominal} onChange={(e) => setD3({ ...d3, abdominal: e.target.value })} style={inputStyle} /></div>
              <div><label style={lbl}>Coxa (mm)</label><input type="number" value={d3.coxa} onChange={(e) => setD3({ ...d3, coxa: e.target.value })} style={inputStyle} /></div>
            </div>
            <button onClick={salvarDobras3} style={{ ...btnPrimary, marginTop: 14 }}>Calcular e salvar</button>
          </div>
        )}

        {tipoForm === "dobras7" && (
          <div>
            <div style={{ fontSize: 12, color: MUTED, marginBottom: 12 }}>Protocolo 7 dobras (mm). Mais preciso. O % de gordura é calculado automaticamente.</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div><label style={lbl}>Peso (kg)</label><input type="number" step="0.1" value={d7.peso || ""} onChange={(e) => setD7({ ...d7, peso: e.target.value })} style={inputStyle} /></div>
              {campos7.map(([k, l]) => (
                <div key={k}><label style={lbl}>{l} (mm)</label><input type="number" value={d7[k] || ""} onChange={(e) => setD7({ ...d7, [k]: e.target.value })} style={inputStyle} /></div>
              ))}
            </div>
            <button onClick={salvarDobras7} style={{ ...btnPrimary, marginTop: 14 }}>Calcular e salvar</button>
          </div>
        )}
      </div>

      {/* HISTÓRICO DE MEDIDAS — lista todas, com opção de remover */}
      {medidasOrd.length > 0 && (
        <div style={card}>
          <div style={cardTitle}>MEDIDAS REGISTRADAS ({medidasOrd.length})</div>
          {[...comNota].reverse().map((m, i) => {
            const chave = m.data + "|" + m.tipo;
            const emEdicao = editandoMedida === chave;
            // Campos editáveis conforme o tipo de medida
            const camposInbody = [["peso", "Peso (kg)"], ["percGordura", "% Gordura"], ["massaMuscular", "Músculo (kg)"], ["gorduraVisceral", "Visceral"], ["cinturaQuadril", "Cintura/Quadril"], ["agua", "Água (L)"]];
            const camposDobras = [["peso", "Peso (kg)"], ["percGordura", "% Gordura"]];
            const campos = m.tipo === "inbody" ? camposInbody : camposDobras;
            return (
              <div key={m.data + m.tipo + i} style={{ padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: TEXT, fontSize: 14, fontWeight: 600 }}>
                      {fmtData(m.data)}
                      <span style={{ color: MUTED, fontWeight: 400, marginLeft: 8, fontSize: 12 }}>
                        {m.tipo === "inbody" ? "InBody" : m.tipo === "dobras3" ? "3 dobras" : "7 dobras"}
                      </span>
                    </div>
                    <div style={{ color: MUTED, fontSize: 12, fontFamily: "'DM Mono', monospace" }}>
                      nota {m.nota}
                      {m.peso != null && " · " + m.peso + "kg"}
                      {m.percGordura != null && " · " + m.percGordura + "% gord"}
                      {m.massaMuscular != null && " · " + m.massaMuscular + "kg músc"}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                    <button onClick={() => (emEdicao ? setEditandoMedida(null) : abrirEdicao(m))} style={{ background: "none", border: "none", color: emEdicao ? ACCENT : MUTED, cursor: "pointer", fontSize: 16, padding: "4px 8px" }} aria-label="Editar medida">
                      {emEdicao ? "▲" : "✎"}
                    </button>
                    <button onClick={() => removerMedida(m.data, m.tipo)} style={{ background: "none", border: "none", color: RED, cursor: "pointer", fontSize: 18 }} aria-label="Remover medida">×</button>
                  </div>
                </div>

                {/* Painel de edição inline — aparece ao tocar no ✎ */}
                {emEdicao && (
                  <div style={{ background: CARD2, border: "1px solid " + ACCENT, borderRadius: 10, padding: 12, marginTop: 10 }}>
                    {m.tipo !== "inbody" && (
                      <div style={{ fontSize: 11, color: MUTED, marginBottom: 8 }}>
                        Dobras: aqui você ajusta peso e % de gordura diretamente. Para recalcular pelas dobras em mm, registre uma nova medida.
                      </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {campos.map(([k, l]) => (
                        <div key={k}>
                          <label style={lbl}>{l}</label>
                          <input type="number" step="0.1" value={rascunho[k]} onChange={(e) => setRascunho({ ...rascunho, [k]: e.target.value })} style={inputSm} />
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                      <button onClick={() => salvarEdicao(m)} style={{ ...btnPrimarySm, flex: 1 }}>Salvar alterações</button>
                      <button onClick={() => setEditandoMedida(null)} style={btnGhost}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================ [UI-TREI] =====================================
function AbaTreinos({ dados, setDados, pesoAtual }) {
  const [treinoAtivo, setTreinoAtivo] = useState(null);
  const [editandoFicha, setEditandoFicha] = useState(null);
  const [duracao, setDuracao] = useState("");
  const [intensidade, setIntensidade] = useState(6);
  const [kcalSW, setKcalSW] = useState("");
  const [fonteKcal, setFonteKcal] = useState("formula");

  // Cronômetro: guardamos o INSTANTE de início e calculamos o tempo decorrido
  // pela diferença com "agora". Isso é robusto: mesmo se a tela do celular
  // dormir durante o descanso entre séries, ao voltar o tempo está correto
  // (um contador que apenas incrementa atrasaria nessas situações).
  const [agora, setAgora] = useState(Date.now());
  useEffect(() => {
    if (!treinoAtivo) return;
    const id = setInterval(() => setAgora(Date.now()), 1000);
    return () => clearInterval(id);
  }, [treinoAtivo]);

  // Segundos decorridos desde o início do treino ativo
  const segDecorridos = treinoAtivo ? Math.floor((agora - treinoAtivo.inicio) / 1000) : 0;
  // Formata como HH:MM:SS ou MM:SS
  function fmtCrono(seg) {
    const h = Math.floor(seg / 3600);
    const m = Math.floor((seg % 3600) / 60);
    const s = seg % 60;
    const pad = (n) => String(n).padStart(2, "0");
    return h > 0 ? h + ":" + pad(m) + ":" + pad(s) : pad(m) + ":" + pad(s);
  }

  function iniciar(fichaId) {
    const ficha = dados.fichas.find((f) => f.id === fichaId);
    const series = {};
    ficha.exercicios.forEach((ex, i) => { series[i] = Array.from({ length: ex.series }, () => ({ reps: ex.repsAlvo, carga: "" })); });
    setAgora(Date.now());
    setTreinoAtivo({ fichaId, series, inicio: Date.now() }); // registra o horário de início
  }
  function atualizarSerie(ei, si, campo, val) {
    const ns = { ...treinoAtivo.series };
    ns[ei] = [...ns[ei]]; ns[ei][si] = { ...ns[ei][si], [campo]: val };
    setTreinoAtivo({ ...treinoAtivo, series: ns });
  }
  function finalizar() {
    // Duração: usa a cronometrada (em minutos, arredondada) a menos que o
    // usuário tenha digitado uma duração manual no campo (que tem prioridade).
    const minCronometrados = Math.max(1, Math.round(segDecorridos / 60));
    const duracaoFinal = duracao ? +duracao : minCronometrados;
    const kcal = (fonteKcal === "smartwatch" && kcalSW) ? +kcalSW : calcularCaloriasTreino(intensidade, pesoAtual, duracaoFinal);
    const reg = { id: Date.now(), data: hoje(), fichaId: treinoAtivo.fichaId, duracaoMin: duracaoFinal, kcal, fonteKcal, series: treinoAtivo.series };
    setDados({ ...dados, historicoTreinos: [reg, ...dados.historicoTreinos] });
    setTreinoAtivo(null); setDuracao(""); setKcalSW("");
  }

  // ---- REMOVER / EDITAR treino do histórico ----
  // Identificamos cada treino pelo id. Treinos antigos (sem id) caem para o
  // índice real no array como chave de fallback.
  const [editandoTreino, setEditandoTreino] = useState(null); // chave do treino aberto
  const [rascunhoT, setRascunhoT] = useState(null); // cópia editável do treino

  const chaveTreino = (t, idxReal) => (t.id != null ? "id:" + t.id : "idx:" + idxReal);

  function removerTreino(t, idxReal) {
    if (!confirm("Remover este treino de " + fmtData(t.data) + "?")) return;
    const lista = dados.historicoTreinos.filter((x, i) =>
      t.id != null ? x.id !== t.id : i !== idxReal
    );
    setDados({ ...dados, historicoTreinos: lista });
  }

  function abrirEdicaoTreino(t, idxReal) {
    setEditandoTreino(chaveTreino(t, idxReal));
    // Cópia profunda das séries para editar sem afetar o original até salvar
    setRascunhoT({
      data: t.data,
      duracaoMin: String(t.duracaoMin),
      kcal: String(t.kcal),
      series: JSON.parse(JSON.stringify(t.series || {})),
    });
  }

  function editarSerieRascunho(ei, si, campo, val) {
    setRascunhoT((prev) => {
      const series = { ...prev.series };
      series[ei] = [...series[ei]];
      series[ei][si] = { ...series[ei][si], [campo]: val };
      return { ...prev, series };
    });
  }

  function salvarEdicaoTreino(t, idxReal) {
    const dur = parseInt(rascunhoT.duracaoMin, 10);
    const kc = parseInt(rascunhoT.kcal, 10);
    if (!dur || dur < 1) { alert("Informe uma duração válida."); return; }
    if (!kc || kc < 0) { alert("Informe calorias válidas."); return; }
    const atualizado = { ...t, data: rascunhoT.data, duracaoMin: dur, kcal: kc, series: rascunhoT.series };
    const lista = dados.historicoTreinos.map((x, i) =>
      (t.id != null ? x.id === t.id : i === idxReal) ? atualizado : x
    );
    setDados({ ...dados, historicoTreinos: lista });
    setEditandoTreino(null); setRascunhoT(null);
    alert("Treino de " + fmtData(rascunhoT.data) + " atualizado.");
  }

  // ---- treino em andamento ----
  if (treinoAtivo) {
    const ficha = dados.fichas.find((f) => f.id === treinoAtivo.fichaId);
    const minParaCalculo = duracao ? +duracao : Math.max(1, Math.round(segDecorridos / 60));
    const kcalEst = calcularCaloriasTreino(intensidade, pesoAtual, minParaCalculo);
    return (
      <div>
        <div style={{ ...card, borderColor: ACCENT, textAlign: "center" }}>
          <div style={{ fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 4 }}>TREINO EM ANDAMENTO</div>
          <div style={{ fontSize: 16, color: TEXT, fontWeight: 700, marginBottom: 12 }}>{ficha.nome}</div>
          {/* Cronômetro grande */}
          <div style={{ fontSize: 48, fontWeight: 900, color: ACCENT, fontFamily: "'DM Mono', monospace", lineHeight: 1, letterSpacing: 1 }}>
            {fmtCrono(segDecorridos)}
          </div>
          <div style={{ fontSize: 12, color: MUTED, marginTop: 6 }}>tempo de treino</div>
        </div>
        {ficha.exercicios.map((ex, ei) => (
          <div key={ei} style={{ ...card, padding: 16, marginBottom: 12 }}>
            <div style={{ color: TEXT, fontWeight: 700, fontSize: 15, marginBottom: 10 }}>{ex.nome}</div>
            <div style={{ display: "grid", gridTemplateColumns: "30px 1fr 1fr", gap: 8, alignItems: "center" }}>
              <div style={{ fontSize: 11, color: MUTED }}>#</div><div style={{ fontSize: 11, color: MUTED }}>Reps</div><div style={{ fontSize: 11, color: MUTED }}>Carga (kg)</div>
              {treinoAtivo.series[ei].map((s, si) => (
                <React.Fragment key={si}>
                  <div style={{ color: MUTED, fontSize: 13, fontWeight: 700 }}>{si + 1}</div>
                  <input type="number" value={s.reps} onChange={(e) => atualizarSerie(ei, si, "reps", e.target.value)} style={inputSm} />
                  <input type="number" placeholder="0" value={s.carga} onChange={(e) => atualizarSerie(ei, si, "carga", e.target.value)} style={inputSm} />
                </React.Fragment>
              ))}
            </div>
          </div>
        ))}
        <div style={card}>
          <div style={cardTitle}>FINALIZAR — CALORIAS GASTAS</div>
          <div style={{ background: CARD2, borderRadius: 10, padding: 12, marginBottom: 12, textAlign: "center" }}>
            <div style={{ fontSize: 12, color: MUTED }}>Duração cronometrada</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: ACCENT, fontFamily: "'DM Mono', monospace" }}>
              {Math.max(1, Math.round(segDecorridos / 60))} min
            </div>
          </div>
          <label style={lbl}>Ajustar duração manualmente (opcional)</label>
          <input type="number" placeholder={"deixe vazio para usar " + Math.max(1, Math.round(segDecorridos / 60)) + " min"} value={duracao} onChange={(e) => setDuracao(e.target.value)} style={{ ...inputStyle, marginBottom: 12 }} />
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button onClick={() => setFonteKcal("formula")} style={fonteKcal === "formula" ? toggleOn : toggleOff}>Estimar (fórmula)</button>
            <button onClick={() => setFonteKcal("smartwatch")} style={fonteKcal === "smartwatch" ? toggleOn : toggleOff}>Smartwatch</button>
          </div>
          {fonteKcal === "formula" ? (
            <div>
              <label style={lbl}>Intensidade</label>
              <select value={intensidade} onChange={(e) => setIntensidade(+e.target.value)} style={inputStyle}>
                {ATIVIDADES_MET.map((a) => <option key={a.nome} value={a.met}>{a.nome}</option>)}
              </select>
              <div style={{ marginTop: 10, fontSize: 14, color: ACCENT, fontFamily: "'DM Mono', monospace" }}>Estimativa: {kcalEst} kcal</div>
            </div>
          ) : (
            <div><label style={lbl}>Calorias do relógio</label><input type="number" value={kcalSW} onChange={(e) => setKcalSW(e.target.value)} style={inputStyle} /></div>
          )}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={finalizar} style={{ ...btnPrimary, flex: 1 }}>Finalizar treino</button>
          <button onClick={() => setTreinoAtivo(null)} style={btnSec}>Cancelar</button>
        </div>
      </div>
    );
  }

  // ---- edição de ficha ----
  if (editandoFicha) {
    const ficha = dados.fichas.find((f) => f.id === editandoFicha);
    function addExercicio() {
      const nova = { ...ficha, exercicios: [...ficha.exercicios, { nome: "Novo exercício", series: 3, repsAlvo: 10 }] };
      setDados({ ...dados, fichas: dados.fichas.map((f) => f.id === ficha.id ? nova : f) });
    }
    function removerExercicio(idx) {
      const nova = { ...ficha, exercicios: ficha.exercicios.filter((_, i) => i !== idx) };
      setDados({ ...dados, fichas: dados.fichas.map((f) => f.id === ficha.id ? nova : f) });
    }
    function editarEx(idx, campo, val) {
      const exs = ficha.exercicios.map((ex, i) => i === idx ? { ...ex, [campo]: campo === "nome" ? val : +val } : ex);
      setDados({ ...dados, fichas: dados.fichas.map((f) => f.id === ficha.id ? { ...ficha, exercicios: exs } : f) });
    }
    return (
      <div>
        <div style={{ ...card, borderColor: ACCENT }}>
          <div style={{ fontSize: 13, color: ACCENT, fontWeight: 700, marginBottom: 4 }}>EDITANDO FICHA</div>
          <div style={{ fontSize: 16, color: TEXT, fontWeight: 700 }}>{ficha.nome}</div>
        </div>
        {ficha.exercicios.map((ex, idx) => (
          <div key={idx} style={{ ...card, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
              <input value={ex.nome} onChange={(e) => editarEx(idx, "nome", e.target.value)} style={{ ...inputStyle, fontWeight: 700 }} />
              <button onClick={() => removerExercicio(idx)} style={{ background: "none", border: "none", color: RED, fontSize: 20, cursor: "pointer", marginLeft: 8 }}>×</button>
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <div style={{ flex: 1 }}><label style={lbl}>Séries</label><input type="number" value={ex.series} onChange={(e) => editarEx(idx, "series", e.target.value)} style={inputSm} /></div>
              <div style={{ flex: 1 }}><label style={lbl}>Reps alvo</label><input type="number" value={ex.repsAlvo} onChange={(e) => editarEx(idx, "repsAlvo", e.target.value)} style={inputSm} /></div>
            </div>
          </div>
        ))}
        <button onClick={addExercicio} style={{ ...btnSec, width: "100%", marginBottom: 10 }}>+ Adicionar exercício</button>
        <button onClick={() => setEditandoFicha(null)} style={btnPrimary}>Concluir edição</button>
      </div>
    );
  }

  // ---- lista de fichas + histórico ----
  return (
    <div>
      <div style={card}>
        <div style={cardTitle}>SUAS FICHAS</div>
        {dados.fichas.map((f) => (
          <div key={f.id} style={{ background: CARD2, border: "1px solid " + BORDER, borderRadius: 12, padding: 14, marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ flex: 1 }}>
                <div style={{ color: TEXT, fontWeight: 700, fontSize: 14 }}>{f.nome}</div>
                <div style={{ color: MUTED, fontSize: 12 }}>{f.exercicios.length} exercícios</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditandoFicha(f.id)} style={btnGhost}>Editar</button>
                <button onClick={() => iniciar(f.id)} style={btnPrimarySm}>Iniciar</button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {dados.historicoTreinos.length > 0 && (
        <div style={card}>
          <div style={cardTitle}>HISTÓRICO</div>
          {dados.historicoTreinos.map((t, idxReal) => ({ t, idxReal })).slice(0, 12).map(({ t, idxReal }) => {
            const ficha = dados.fichas.find((f) => f.id === t.fichaId);
            const chave = chaveTreino(t, idxReal);
            const emEdicao = editandoTreino === chave;
            return (
              <div key={chave} style={{ padding: "10px 0", borderBottom: "1px solid " + BORDER }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ color: TEXT, fontSize: 14 }}>{ficha ? ficha.nome.split("—")[0] : t.fichaId}</div>
                    <div style={{ color: MUTED, fontSize: 12 }}>{fmtData(t.data)} · {t.duracaoMin}min</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ color: ACCENT, fontFamily: "'DM Mono', monospace", fontWeight: 700 }}>{t.kcal} kcal</div>
                      <div style={{ color: MUTED, fontSize: 11 }}>{t.fonteKcal === "smartwatch" ? "relógio" : "estimado"}</div>
                    </div>
                    <button onClick={() => (emEdicao ? (setEditandoTreino(null), setRascunhoT(null)) : abrirEdicaoTreino(t, idxReal))} style={{ background: "none", border: "none", color: emEdicao ? ACCENT : MUTED, cursor: "pointer", fontSize: 16, padding: "4px 6px" }} aria-label="Editar treino">
                      {emEdicao ? "▲" : "✎"}
                    </button>
                    <button onClick={() => removerTreino(t, idxReal)} style={{ background: "none", border: "none", color: RED, cursor: "pointer", fontSize: 18 }} aria-label="Remover treino">×</button>
                  </div>
                </div>

                {/* Painel de edição do treino */}
                {emEdicao && rascunhoT && (
                  <div style={{ background: CARD2, border: "1px solid " + ACCENT, borderRadius: 10, padding: 12, marginTop: 10 }}>
                    {/* Dados principais */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
                      <div>
                        <label style={lbl}>Data</label>
                        <input type="date" value={rascunhoT.data} max={hoje()} onChange={(e) => { if (e.target.value) setRascunhoT({ ...rascunhoT, data: e.target.value }); }} style={inputSm} />
                      </div>
                      <div>
                        <label style={lbl}>Duração (min)</label>
                        <input type="number" value={rascunhoT.duracaoMin} onChange={(e) => setRascunhoT({ ...rascunhoT, duracaoMin: e.target.value })} style={inputSm} />
                      </div>
                      <div style={{ gridColumn: "1 / -1" }}>
                        <label style={lbl}>Calorias (kcal)</label>
                        <input type="number" value={rascunhoT.kcal} onChange={(e) => setRascunhoT({ ...rascunhoT, kcal: e.target.value })} style={inputSm} />
                      </div>
                    </div>

                    {/* Séries por exercício */}
                    {ficha && rascunhoT.series && Object.keys(rascunhoT.series).length > 0 && (
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ fontSize: 11, color: MUTED, marginBottom: 8, fontWeight: 600 }}>SÉRIES (reps · carga)</div>
                        {ficha.exercicios.map((ex, ei) => (
                          rascunhoT.series[ei] ? (
                            <div key={ei} style={{ marginBottom: 10 }}>
                              <div style={{ color: TEXT, fontSize: 13, fontWeight: 600, marginBottom: 6 }}>{ex.nome}</div>
                              <div style={{ display: "grid", gridTemplateColumns: "20px 1fr 1fr", gap: 6, alignItems: "center" }}>
                                {rascunhoT.series[ei].map((s, si) => (
                                  <React.Fragment key={si}>
                                    <div style={{ color: MUTED, fontSize: 12, fontWeight: 700 }}>{si + 1}</div>
                                    <input type="number" value={s.reps} onChange={(e) => editarSerieRascunho(ei, si, "reps", e.target.value)} style={{ ...inputSm, padding: "6px 8px" }} placeholder="reps" />
                                    <input type="number" value={s.carga} onChange={(e) => editarSerieRascunho(ei, si, "carga", e.target.value)} style={{ ...inputSm, padding: "6px 8px" }} placeholder="kg" />
                                  </React.Fragment>
                                ))}
                              </div>
                            </div>
                          ) : null
                        ))}
                      </div>
                    )}

                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => salvarEdicaoTreino(t, idxReal)} style={{ ...btnPrimarySm, flex: 1 }}>Salvar alterações</button>
                      <button onClick={() => { setEditandoTreino(null); setRascunhoT(null); }} style={btnGhost}>Cancelar</button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================ [UI-DASH] =====================================
/*
 * DASHBOARD de déficit/superávit.
 * Lógica: para cada dia, balanço = (consumido) - (meta + gasto em treino).
 *   - Negativo = déficit (perdendo peso) — bom para o objetivo
 *   - Positivo = superávit (ganhando peso)
 * Agregamos por dia, semana (7d) e mês (30d).
 */
function AbaDashboard({ dados }) {
  const d = hoje();
  const metaCal = dados.metaCalorias || TMB_INBODY;

  function totaisDoDia(data) {
    const dia = dados.diario[data];
    const itens = dia ? dia.itens : [];
    const consumido = itens.reduce((a, it) => ({ kcal: a.kcal + it.kcal, p: a.p + it.p, c: a.c + it.c, g: a.g + it.g }), { kcal: 0, p: 0, c: 0, g: 0 });
    const treinosDia = dados.historicoTreinos.filter((t) => t.data === data);
    const gastoTreino = treinosDia.reduce((a, t) => a + t.kcal, 0);
    return { consumido, gastoTreino };
  }

  // Balanço calórico do dia = consumido - (meta + gastoTreino)
  function balancoDia(data) {
    const { consumido, gastoTreino } = totaisDoDia(data);
    return {
      kcal: consumido.kcal - (metaCal + gastoTreino),
      p: consumido.p - META_MACROS.proteina,
      c: consumido.c - META_MACROS.carbo,
      g: consumido.g - META_MACROS.gordura,
      temDados: consumido.kcal > 0,
    };
  }

  function diasAtras(n) {
    const arr = [];
    const h = hoje(); // já no fuso de Brasília
    for (let i = 0; i < n; i++) {
      arr.push(somarDias(h, -i));
    }
    return arr;
  }

  function agregado(n) {
    const dias = diasAtras(n).filter((dia) => balancoDia(dia).temDados);
    if (dias.length === 0) return null;
    const soma = dias.reduce((acc, dia) => {
      const b = balancoDia(dia);
      return { kcal: acc.kcal + b.kcal, p: acc.p + b.p, c: acc.c + b.c, g: acc.g + b.g };
    }, { kcal: 0, p: 0, c: 0, g: 0 });
    return { ...soma, dias: dias.length };
  }

  const balHoje = balancoDia(d);
  const balSemana = agregado(7);
  const balMes = agregado(30);

  function CardBalanco({ titulo, bal, periodo }) {
    if (!bal || (periodo !== "hoje" && bal.dias === 0)) {
      return (
        <div style={card}>
          <div style={cardTitle}>{titulo}</div>
          <div style={{ color: MUTED, fontSize: 14 }}>Sem dados registrados ainda neste período.</div>
        </div>
      );
    }
    const kcal = Math.round(bal.kcal);
    const deficit = kcal < 0;
    return (
      <div style={card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 14 }}>
          <span style={cardTitle}>{titulo}</span>
          {bal.dias && <span style={{ fontSize: 11, color: MUTED }}>{bal.dias} {bal.dias === 1 ? "dia" : "dias"} com registro</span>}
        </div>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <div style={{ fontSize: 40, fontWeight: 900, fontFamily: "'DM Mono', monospace", color: deficit ? ACCENT : ORANGE, lineHeight: 1 }}>
            {kcal > 0 ? "+" : ""}{kcal}
          </div>
          <div style={{ fontSize: 13, color: MUTED, marginTop: 4 }}>
            kcal · {deficit ? "DÉFICIT (perdendo)" : kcal === 0 ? "neutro" : "SUPERÁVIT (ganhando)"}
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {[["Proteína", bal.p, BLUE], ["Carbo", bal.c, ORANGE], ["Gordura", bal.g, PINK]].map(([l, v, cor]) => (
            <div key={l} style={{ background: CARD2, borderRadius: 10, padding: "10px 8px", textAlign: "center" }}>
              <div style={{ fontSize: 11, color: MUTED }}>{l}</div>
              <div style={{ fontSize: 16, fontWeight: 800, fontFamily: "'DM Mono', monospace", color: cor }}>{v > 0 ? "+" : ""}{Math.round(v)}g</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ ...card, background: "linear-gradient(135deg," + CARD + "," + CARD2 + ")" }}>
        <div style={cardTitle}>COMO LER ESTE PAINEL</div>
        <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.5 }}>
          O balanço compara o que você comeu com sua meta ({metaCal} kcal) mais o gasto nos treinos.
          Número <span style={{ color: ACCENT, fontWeight: 700 }}>negativo = déficit</span> (caminho para perder gordura).
          Número <span style={{ color: ORANGE, fontWeight: 700 }}>positivo = superávit</span>.
        </div>
      </div>
      <CardBalanco titulo="HOJE" bal={balHoje} periodo="hoje" />
      <CardBalanco titulo="ÚLTIMOS 7 DIAS" bal={balSemana} periodo="semana" />
      <CardBalanco titulo="ÚLTIMOS 30 DIAS" bal={balMes} periodo="mes" />
    </div>
  );
}

// ============================ [APP] =========================================
export default function App() {
  const [dados, setDados] = useState(() => carregarDados() || ESTADO_INICIAL);
  const [aba, setAba] = useState("hoje");
  useEffect(() => { salvarDados(dados); }, [dados]);

  const pesoAtual = useMemo(() => {
    const ms = [...dados.medidas].filter((m) => m.peso != null).sort((a, b) => b.data.localeCompare(a.data));
    return ms[0]?.peso || 83;
  }, [dados.medidas]);

  const abas = [
    { id: "hoje", nome: "Hoje" },
    { id: "dashboard", nome: "Balanço" },
    { id: "medidas", nome: "Medidas" },
    { id: "treinos", nome: "Treinos" },
  ];

  return (
    <div style={{ minHeight: "100vh", background: BG, color: TEXT, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=DM+Mono:wght@500;700&display=swap');
        * { -webkit-tap-highlight-color: transparent; }
        input:focus, select:focus, textarea:focus { border-color: ${ACCENT} !important; }
        button:focus-visible { outline: 2px solid ${ACCENT}; outline-offset: 2px; }
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-thumb { background: ${BORDER}; border-radius: 99px; }
        @media (prefers-reduced-motion: reduce) { * { transition: none !important; } }
      `}</style>
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "20px 16px 100px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>FIT<span style={{ color: ACCENT }}>·</span>TRACKER</div>
            <div style={{ fontSize: 12, color: MUTED }}>Olá, {PERFIL.nome}</div>
          </div>
          <div style={{ fontSize: 12, color: MUTED, fontFamily: "'DM Mono', monospace" }}>{fmtData(hoje())}</div>
        </div>
        {aba === "hoje" && <AbaHoje dados={dados} setDados={setDados} pesoAtual={pesoAtual} />}
        {aba === "dashboard" && <AbaDashboard dados={dados} />}
        {aba === "medidas" && <AbaMedidas dados={dados} setDados={setDados} />}
        {aba === "treinos" && <AbaTreinos dados={dados} setDados={setDados} pesoAtual={pesoAtual} />}
      </div>
      <div style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: CARD, borderTop: "1px solid " + BORDER }}>
        <div style={{ maxWidth: 480, margin: "0 auto", display: "flex" }}>
          {abas.map((a) => (
            <button key={a.id} onClick={() => setAba(a.id)} style={{ flex: 1, padding: "14px 0", background: "none", border: "none", cursor: "pointer", color: aba === a.id ? ACCENT : MUTED, fontWeight: 700, fontSize: 13, borderTop: "2px solid " + (aba === a.id ? ACCENT : "transparent") }}>
              {a.nome}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
