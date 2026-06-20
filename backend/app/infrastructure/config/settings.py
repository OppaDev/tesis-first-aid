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
    asr_model: str = "medium"
    asr_device: str = "cpu"
    asr_compute_type: str = "int8"
    asr_idioma: str = "es"


settings = Settings()
