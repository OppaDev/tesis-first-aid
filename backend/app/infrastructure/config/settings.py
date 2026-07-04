from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
    )

    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    # ASR (faster-whisper). En despliegue con GPU: asr_device="cuda", asr_compute_type="float16".
    asr_model: str = "small"
    asr_device: str = "cpu"
    asr_compute_type: str = "int8"
    asr_idioma: str = "es"

    # Rate limiting (slowapi). Límite global por IP y otros más estrictos para
    # endpoints sensibles (login, registro de cuentas).
    rate_limit_default: str = "120/minute"
    rate_limit_login: str = "10/minute"
    rate_limit_registro: str = "5/minute"

    # Tamaño máximo del audio de consulta (MB). Evita agotar memoria con subidas grandes.
    max_audio_mb: int = 10

    # Orígenes permitidos para CORS, separados por coma. "*" permite todos
    # (útil en desarrollo); en producción restringir al dominio del panel web,
    # p. ej.: "https://panel.tudominio.com,http://localhost:8080".
    cors_origins: str = "*"

    @property
    def cors_origins_list(self) -> list[str]:
        return [origen.strip() for origen in self.cors_origins.split(",") if origen.strip()]


settings = Settings()
