import unittest
import requests
import pandas as pd
import os

## Este teste é para verificar se o usuário consegue acessar o kanban sem estar autenticado.(deve falhar)
class RouteTest(unittest.TestCase):
    def setUp(self):
        self.url = "http://127.0.0.1:5000/"
        self.requestr = []
        self.i = 0

    def test_routeKanban(self):
        try:
            response = requests.get(self.url)
            self.assertEqual(response.status_code, 200, "Usuário não está autenticado")
            if response.status_code == 200:
                print("Sucesso:", response.json())
                self.requestr.append("Aprovado")
            else:
                self.requestr.append("Reprovado")
        except Exception as e:
            print("Erro na requisição:", e)
            self.requestr.append("Reprovado")

    def tearDown(self):
        self.i += 1
        if not self.requestr:  
            self.requestr.append("Reprovado")
        data = {
            'Teste na rota do Kanban nº': [self.i],
            'Resultado': [self.requestr[0]]
        }
        df = pd.DataFrame(data)
        df.to_csv('resultado_routeKanban.csv', mode='a', header=not os.path.exists('resultado_routeKanban.csv'))

if __name__ == "__main__":
    unittest.main()