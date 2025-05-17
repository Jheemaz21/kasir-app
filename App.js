import React, { useState } from 'react';
import {
  View,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Provider as PaperProvider,
  Text,
  TextInput,
  Button,
  Card,
  DefaultTheme,
  DarkTheme,
  Title,
} from 'react-native-paper';

export default function App() {
  const [search, setSearch] = useState('');
  const [lastTransaction, setLastTransaction] = useState(null);
  const [products, setProducts] = useState([
    { id: '1', name: 'Kopi', price: 10000 },
    { id: '2', name: 'Teh', price: 8000 },
    { id: '3', name: 'Roti', price: 15000 },
  ]);
  const [editingProduct, setEditingProduct] = useState(null); // Produk yang sedang diedit
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const theme = isDarkMode ? DarkTheme : DefaultTheme;

  const [cart, setCart] = useState([]);
  const [history, setHistory] = useState([]);
  const [newName, setNewName] = useState('');
  const [newPrice, setNewPrice] = useState('');

  const addToCart = (product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1); // hapus 1 item di index tsb
    setCart(newCart);
  };

  const total = cart.reduce((sum, item) => sum + item.price, 0);

  const addProduct = () => {
    if (!newName || !newPrice) {
      Alert.alert('Error', 'Nama dan harga harus diisi');
      return;
    }

    const price = parseInt(newPrice);
    if (isNaN(price)) {
      Alert.alert('Error', 'Harga harus berupa angka');
      return;
    }

    const newProduct = {
      id: Date.now().toString(),
      name: newName,
      price: price,
    };

    setProducts([...products, newProduct]);
    setNewName('');
    setNewPrice('');
  };

  const handlePayment = () => {
    if (cart.length === 0) {
      Alert.alert('Info', 'Keranjang masih kosong');
      return;
    }

    Alert.alert(
      'Pembayaran Berhasil',
      `Total: Rp${total}`,
      [
        {
          text: 'OK',
          onPress: () => {
            const newTransaction = {
              id: Date.now().toString(),
              items: cart,
              total: total,
              timestamp: new Date().toLocaleString(),
            };

            setLastTransaction(newTransaction); // simpan transaksi terakhir
            setHistory([newTransaction, ...history]); // tambahkan ke riwayat
            setCart([]); // reset keranjang
          },
        },
      ]
    );
  };

  const deleteProduct = (id) => {
    Alert.alert(
      'Konfirmasi',
      'Yakin ingin menghapus produk ini?',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Hapus',
          style: 'destructive',
          onPress: () => {
            setProducts(products.filter((item) => item.id !== id));
          },
        },
      ]
    );
  };

  const undoLastTransaction = () => {
    if (!lastTransaction) {
      Alert.alert('Info', 'Tidak ada transaksi terakhir untuk di-undo');
      return;
    }

    // Masukkan kembali item ke keranjang
    setCart([...cart, ...lastTransaction.items]);

    // Hapus transaksi dari history
    setHistory(history.filter((trx) => trx.id !== lastTransaction.id));

    // Hapus backup-nya
    setLastTransaction(null);

    Alert.alert('Undo Berhasil', 'Transaksi terakhir dikembalikan ke keranjang.');
  };

  const startEditing = (product) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
  };

  const saveEditedProduct = () => {
    const updated = products.map((p) =>
      p.id === editingProduct.id
        ? { ...p, name: editName, price: parseInt(editPrice) }
        : p
    );
    setProducts(updated);
    setEditingProduct(null);
    setEditName('');
    setEditPrice('');
  };



  return (
    <PaperProvider theme={theme}>
      <ScrollView style={{ padding: 20, marginTop: 30 }}>
        <Title style={{ fontSize: 28, textAlign: 'center', marginBottom: 20 }}>💸 Aplikasi Kasir</Title>

        {/* Tambah Produk Manual */}
        <Button
          icon="theme-light-dark"
          mode="outlined"
          onPress={() => setIsDarkMode(!isDarkMode)}
          style={{ marginBottom: 20 }}
        >
          Ganti ke {isDarkMode ? 'Light' : 'Dark'} Mode
        </Button>
        <Title style={{ fontSize: 20 }}>➕ Tambah Produk Manual</Title>
        <TextInput
          label="Nama Produk"
          value={newName}
          onChangeText={setNewName}
          mode="outlined"
          style={{ marginBottom: 10 }}
        />
        <TextInput
          label="Harga Produk"
          value={newPrice}
          onChangeText={setNewPrice}
          keyboardType="numeric"
          mode="outlined"
          style={{ marginBottom: 10 }}
        />
        <Button mode="contained" onPress={addProduct}>Tambah Produk</Button>
        <TextInput
          label="Cari Produk"
          value={search}
          onChangeText={setSearch}
          mode="outlined"
          style={{ marginTop: 20, marginBottom: 10 }}
        />

        {/* Daftar Produk */}
        <Title style={{ fontSize: 20, marginTop: 30 }}>📦 Daftar Produk</Title>
        {products
          .filter((item) => item.name.toLowerCase().includes(search.toLowerCase()))
          .map((item) => (

            <Card key={item.id} style={{ marginBottom: 10 }}>
              <Card.Content>
                <Title>{item.name}</Title>
                <Text>Rp{item.price}</Text>

                <Button onPress={() => addToCart(item)} style={{ marginTop: 5 }}>
                  Tambah ke Keranjang
                </Button>

                <Button
                  onPress={() => startEditing(item)}
                  mode="outlined"
                  style={{ marginTop: 5 }}
                >
                  Edit Produk
                </Button>

                <Button
                  onPress={() => deleteProduct(item.id)}
                  mode="text"
                  textColor="red"
                  style={{ marginTop: 5 }}
                >
                  Hapus Produk
                </Button>

              </Card.Content>
            </Card>
          ))}

        {/* Keranjang */}
        <Title style={{ fontSize: 20, marginTop: 30 }}>🛒 Keranjang</Title>
        {cart.length === 0 ? (
          <Text>Tidak ada item di keranjang.</Text>
        ) : (
          cart.map((item, index) => (
            <Card key={index} style={{ marginBottom: 5 }}>
              <Card.Content>
                <Text>{item.name} - Rp{item.price}</Text>
                <Button
                  onPress={() => removeFromCart(index)}
                  mode="text"
                  textColor="red"
                >
                  Hapus
                </Button>
              </Card.Content>
            </Card>
          ))
        )}

        {/* Total & Bayar */}
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginTop: 10 }}>Total: Rp{total}</Text>
        <Button
          mode="contained"
          onPress={handlePayment}
          disabled={cart.length === 0}
          style={{ marginTop: 10 }}
        >
          Bayar & Simpan Transaksi
        </Button>

        <Button
          mode="outlined"
          onPress={undoLastTransaction}
          disabled={!lastTransaction}
          style={{ marginTop: 10 }}
        >
          ↩️ Undo Transaksi Terakhir
        </Button>


        {/* Riwayat Transaksi */}
        <View style={{ paddingBottom: 100 }}>
          <Title style={{ fontSize: 20, marginTop: 30 }}>🧾 Riwayat Transaksi</Title>
          {history.length === 0 ? (
            <Text>Belum ada transaksi.</Text>
          ) : (
            history.map((trx) => (
              <Card key={trx.id} style={{ marginBottom: 10 }}>
                <Card.Content>
                  <Text style={{ fontWeight: 'bold' }}>🕒 {trx.timestamp}</Text>
                  {trx.items.map((item, i) => (
                    <Text key={i}>• {item.name} - Rp{item.price}</Text>
                  ))}
                  <Text style={{ fontWeight: 'bold', marginTop: 5 }}>Total: Rp{trx.total}</Text>
                </Card.Content>
              </Card>
            ))
          )}
        </View>
      </ScrollView>
      {editingProduct && (
        <View
          style={{
            position: 'absolute',
            top: 100,
            left: 20,
            right: 20,
            backgroundColor: 'white',
            padding: 20,
            borderRadius: 10,
            elevation: 10,
          }}
        >
          <Title>Edit Produk</Title>
          <TextInput
            label="Nama Produk"
            value={editName}
            onChangeText={setEditName}
            mode="outlined"
            style={{ marginBottom: 10 }}
          />
          <TextInput
            label="Harga"
            value={editPrice}
            onChangeText={setEditPrice}
            keyboardType="numeric"
            mode="outlined"
            style={{ marginBottom: 10 }}
          />
          <Button mode="contained" onPress={saveEditedProduct}>
            Simpan Perubahan
          </Button>
          <Button
            onPress={() => setEditingProduct(null)}
            mode="text"
            textColor="red"
            style={{ marginTop: 10 }}
          >
            Batal
          </Button>
        </View>
      )}

    </PaperProvider>

  );
}
