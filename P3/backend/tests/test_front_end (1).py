import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.chrome.options import Options
import sys
import pandas as pd
import os

class LoginTest(unittest.TestCase):

    @classmethod
    def setUpClass(self):
        chrome_options = Options() # configurações do Chrome
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")

        # ChromeDriver Manager baixa o driver automaticamente
        service = Service(ChromeDriverManager().install())

        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)

        # substitui 127.0.0.1 -> localhost no GitHub Actions
        self.BASE_URL = "http://localhost:5500"

        self.requestLogo = [] # guarda resultados do teste test_logo_loads
        self.requestRegister = [] #guarda resultados do teste test_register_link

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit() # fecha o navegador depois dos testes

    # Verifica se o logo carrega na página de login corretamente
    def test_logo_loads(self):
        driver = self.driver
        driver.get(f"{self.BASE_URL}/login.html")

        image = driver.find_element(By.CLASS_NAME, "logo")
        self.assertTrue(image.is_displayed(), "Logo não carregou na página de login")

        if image.is_displayed():
            print("Logo carregado com sucesso.")
            self.requestLogo.append("Aprovado")
        else:
            self.requestLogo.append("Reprovado")

    # Verifica se ao clicar em registrar redireciona corretamente
    def test_register_link(self):
        driver = self.driver
        driver.get(f"{self.BASE_URL}/login.html")

        register_button = driver.find_element(By.CLASS_NAME, "alt")
        register_button.click()

        WebDriverWait(driver, 10).until(
            EC.url_contains("register.html")
        )

        self.assertIn("register.html", driver.current_url,
                      "Redirecionamento para a página de registro falhou")

        if "register.html" in driver.current_url:
            print("Redirecionamento para a página de registro bem-sucedido.")
            self.requestRegister.append("Aprovado")
        else:
            self.requestRegister.append("Reprovado")

    # Salva resultado em CSV
    def tearDown(self):
        test_name = self._testMethodName
        result = "Aprovado" if sys.exc_info() == (None, None, None) else "Reprovado"

        data = {
            "Nome do Teste": [test_name],
            "Resultado": [result]
        }

        df = pd.DataFrame(data)

        df.to_csv(
            "resultado_frontend.csv",
            mode="a",
            header=not os.path.exists("resultado_frontend.csv"),
            index=False
        )


if __name__ == "__main__":
    unittest.main()
