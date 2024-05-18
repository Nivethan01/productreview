import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import axios from "axios";
import ReviewList from "./ReviewList";

const ProductList = ({ product, setProduct }) => {
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductName, setSelectedProductName] = useState("");

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:3001/pro");
      setProduct(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Error fetching products. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const response = await axios.delete(
        `http://localhost:3001/pro/delete/${id}`
      );
      if (response.status === 200) {
        const updatedProduct = product.filter((item) => item._id !== id);
        setProduct(updatedProduct);
        toast.success("Product deleted successfully!");
      } else {
        toast.error("Failed to delete product.");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Error deleting product. Please try again.");
    }
  };

  const handleEdit = (id) => {
    setIsEdit(true);
    setEditId(id);
    const item = product.find((item) => item._id === id);
    setProductName(item.product_name);
    setDescription(item.description);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = { product_name: productName, description };
    try {
      if (!isEdit) {
        const response = await axios.post(
          "http://localhost:3001/pro/create",
          data
        );
        setProduct([...product, response.data]);
        toast.success("Product added successfully!");
      } else {
        const response = await axios.put(
          `http://localhost:3001/pro/update/${editId}`,
          data
        );
        setProduct(
          product.map((item) =>
            item._id === editId ? response.data : item
          )
        );
        setIsEdit(false);
        toast.success("Product updated successfully!");
      }
      setProductName("");
      setDescription("");
    } catch (error) {
      console.error("Error submitting product:", error);
      toast.error("Error submitting product. Please try again.");
    }
  };

  const handleShowReviews = (productId, productName) => {
    setSelectedProductId(productId);
    setSelectedProductName(productName);
  };

  return (
    <div className="body">
      <h1>Product Management</h1>
      <div className="add-product">
        <h2>{isEdit ? "Update Product" : "Add Product"}</h2>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Product Name:</label>
            <input
              type="text"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
            />
          </div>
          <div>
            <label>Description:</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <button type="submit">{isEdit ? "Update" : "Add"}</button>
        </form>
      </div>
      <div className="product-list">
        <h2>Product List</h2>
        <table className="pro_list_tab">
          <thead>
            <tr className="tr">
              <th>Product Name</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {product &&
              product.map((item) => (
                <tr key={item._id}>
                  <td>{item.product_name}</td>
                  <td>{item.description}</td>
                  <td>
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="delete-icon"
                      onClick={() => handleDelete(item._id)}
                    />
                    <FontAwesomeIcon
                      icon={faPencilAlt}
                      className="edit-icon"
                      onClick={() => handleEdit(item._id)}
                    />
                    <button
                      onClick={() => handleShowReviews(item._id)}
                    >
                      Show Reviews
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {selectedProductId && (
        <ReviewList productId={selectedProductId} />
      )}
    </div>
  );
};

export default ProductList;
