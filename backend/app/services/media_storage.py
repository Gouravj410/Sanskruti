import os
import shutil
from abc import ABC, abstractmethod
from pathlib import Path
from typing import BinaryIO
from app.core.config import settings

class BaseStorageService(ABC):
    """Abstract interface for media/image storage.
    Enables swapping between Local storage, S3, GCS, or CDN without affecting the core archive logic.
    """
    
    @abstractmethod
    def save_file(self, file_content: bytes, filename: str) -> str:
        """Save file bytes and return public URL or relative path"""
        pass

    @abstractmethod
    def get_url(self, filename: str) -> str:
        """Return public URL for the file"""
        pass

    @abstractmethod
    def delete_file(self, filename: str) -> bool:
        """Delete file by filename"""
        pass


class LocalStorageService(BaseStorageService):
    def __init__(self, base_dir: str = settings.MEDIA_STORAGE_DIR, url_prefix: str = settings.MEDIA_URL_PREFIX):
        self.base_dir = Path(base_dir)
        self.url_prefix = url_prefix
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save_file(self, file_content: bytes, filename: str) -> str:
        safe_filename = Path(filename).name
        target_path = self.base_dir / safe_filename
        with open(target_path, "wb") as f:
            f.write(file_content)
        return f"{self.url_prefix}/{safe_filename}"

    def get_url(self, filename: str) -> str:
        safe_filename = Path(filename).name
        return f"{self.url_prefix}/{safe_filename}"

    def delete_file(self, filename: str) -> bool:
        safe_filename = Path(filename).name
        target_path = self.base_dir / safe_filename
        if target_path.exists():
            target_path.unlink()
            return True
        return False


def get_storage_service() -> BaseStorageService:
    # Factory: return LocalStorageService for dev, extensible to S3/Cloud
    return LocalStorageService()
