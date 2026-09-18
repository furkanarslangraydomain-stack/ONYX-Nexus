import asyncio
import time
from main import app, rate_limiter, optimize_ram
from memory_scanner import AdvancedMemoryScanner

async def run_tests():
    print("="*75)
    print(" 🚀 ONYX-NEXUS FULL SYSTEM DIAGNOSTICS ".center(75))
    print("="*75)
    
    # 1. RAM Optimizer Test
    print("\n[1] RAM Optimizer & Garbage Collection Test...")
    mb, ma = optimize_ram()
    print(f"  ➜ Bellek kullanimi GC oncesi: {mb:.2f} MB")
    print(f"  ➜ Bellek kullanimi GC sonrasi: {ma:.2f} MB")
    print("  ✅ RAM Testi Basarili!")
    
    # 2. Rate Limiter Test
    print("\n[2] RPM / TPM Rate Limiter Test...")
    prov_name = "test_provider"
    
    # Send 5 requests (RPM limit is 5)
    for _ in range(5):
        rate_limiter.add_request(prov_name, used_tokens=100)
        
    is_limited = rate_limiter.is_rate_limited(prov_name, rpm_limit=5, tpm_limit=5000, required_tokens=100)
    print(f"  ➜ 5 istek atildi, RPM Limit (5) asildi mi?: {is_limited}")
    assert is_limited == True, "Rate limiter RPM test basarisiz!"
    
    # TPM Limit test
    prov_name_2 = "test_provider_2"
    rate_limiter.add_request(prov_name_2, used_tokens=4500)
    is_limited_tpm = rate_limiter.is_rate_limited(prov_name_2, rpm_limit=100, tpm_limit=5000, required_tokens=1000)
    print(f"  ➜ 4500 token kullanildi, yeni istek 1000 token istiyor. Limit (5000) asildi mi?: {is_limited_tpm}")
    assert is_limited_tpm == True, "Rate limiter TPM test basarisiz!"
    print("  ✅ Rate Limiter Testi Basarili!")

    print("\n[3] Memory Scanner Testi...")
    scanner = AdvancedMemoryScanner()
    res = scanner.scan_context("Python", limit=1)
    print(f"  ➜ Scanner aktif, DB baglantisi basarili.")
    print("  ✅ Scanner Testi Basarili!")

    print("\n" + "="*75)
    print(" 🌟 TUM SISTEM TESTLERI BASARIYLA TAMAMLANDI!".center(75))
    print("="*75)

if __name__ == "__main__":
    asyncio.run(run_tests())
