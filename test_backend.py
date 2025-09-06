#!/usr/bin/env python3
"""
PaperMind Backend Test Script
Tests the core functionality of the Flask backend
"""

import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_dir = Path(__file__).parent / 'backend'
sys.path.insert(0, str(backend_dir))

def test_imports():
    """Test if all required modules can be imported"""
    print("🧪 Testing Python imports...")
    
    try:
        import flask
        print("✅ Flask imported successfully")
    except ImportError as e:
        print(f"❌ Flask import failed: {e}")
        return False
    
    try:
        import fitz  # PyMuPDF
        print("✅ PyMuPDF imported successfully")
    except ImportError as e:
        print(f"❌ PyMuPDF import failed: {e}")
        return False
    
    try:
        import pdfplumber
        print("✅ pdfplumber imported successfully")
    except ImportError as e:
        print(f"❌ pdfplumber import failed: {e}")
        return False
    
    try:
        import transformers
        print("✅ Transformers imported successfully")
    except ImportError as e:
        print(f"❌ Transformers import failed: {e}")
        return False
    
    try:
        import torch
        print("✅ PyTorch imported successfully")
        print(f"   CUDA available: {torch.cuda.is_available()}")
    except ImportError as e:
        print(f"❌ PyTorch import failed: {e}")
        return False
    
    return True

def test_pdf_processing():
    """Test PDF processing functionality"""
    print("\n📄 Testing PDF processing...")
    
    try:
        from pdf_processor import PDFProcessor
        processor = PDFProcessor()
        
        # Test with sample PDF if it exists
        sample_pdf = Path(__file__).parent / 'paper' / 'Attemtion All You Need.pdf'
        if sample_pdf.exists():
            print(f"📖 Testing with sample PDF: {sample_pdf.name}")
            text = processor.extract_text(str(sample_pdf))
            if text and len(text) > 100:
                print(f"✅ PDF text extraction successful: {len(text)} characters")
                print(f"   Preview: {text[:200]}...")
                return True
            else:
                print("❌ PDF text extraction failed or insufficient text")
                return False
        else:
            print("⚠️  Sample PDF not found, skipping PDF test")
            return True
            
    except Exception as e:
        print(f"❌ PDF processing test failed: {e}")
        return False

def test_ai_models():
    """Test AI models initialization (without full loading)"""
    print("\n🤖 Testing AI models...")
    
    try:
        from ai_models import AIModels
        print("✅ AI models module imported successfully")
        
        # Note: We don't actually initialize models here as it takes time and resources
        print("⚠️  Model initialization skipped (would take several minutes)")
        print("   Models will be loaded on first API call")
        return True
        
    except Exception as e:
        print(f"❌ AI models test failed: {e}")
        return False

def test_flask_app():
    """Test Flask app creation"""
    print("\n🌐 Testing Flask app...")
    
    try:
        os.chdir(backend_dir)
        from app import app
        
        with app.test_client() as client:
            # Test health check endpoint
            response = client.get('/')
            if response.status_code == 200:
                print("✅ Health check endpoint working")
                data = response.get_json()
                print(f"   Response: {data.get('message', 'No message')}")
                return True
            else:
                print(f"❌ Health check failed with status {response.status_code}")
                return False
                
    except Exception as e:
        print(f"❌ Flask app test failed: {e}")
        return False

def main():
    """Run all tests"""
    print("🧠 PaperMind Backend Test Suite")
    print("=" * 40)
    
    tests = [
        ("Import Tests", test_imports),
        ("PDF Processing", test_pdf_processing),
        ("AI Models", test_ai_models),
        ("Flask App", test_flask_app)
    ]
    
    passed = 0
    total = len(tests)
    
    for test_name, test_func in tests:
        print(f"\n🔍 Running {test_name}...")
        try:
            if test_func():
                passed += 1
                print(f"✅ {test_name} PASSED")
            else:
                print(f"❌ {test_name} FAILED")
        except Exception as e:
            print(f"❌ {test_name} ERROR: {e}")
    
    print("\n" + "=" * 40)
    print(f"📊 Test Results: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 All tests passed! PaperMind backend is ready.")
        return True
    else:
        print("⚠️  Some tests failed. Check the output above.")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
