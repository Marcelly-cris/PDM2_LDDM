import unittest
import requests

class ClientTest(unittest.TestCase):
    def setUp(self):
        self.url = "http://127.0.0.1:5500/login.html"
        self.requestr = []

    def test_clientLogin(self):
        response = requests.get(self.url)
        self.assertEqual(response.status_code, 200, "A requisição falhou")
        if response.status_code == 200:
            print("Sucesso:", response.text)
            self.requestr.append("Aprovado")
        else:
            self.requestr.append("Reprovado")
    def tearDown(self):
        if not self.requestr:  
            self.requestr.append("Reprovado")
        with open('resultado_clientLogin.txt', 'a') as f:
            f.write(f'Teste de login do cliente: {self.requestr[0]}\n')

if __name__ == "__main__":
    unittest.main()