
/* eslint-disable prettier/prettier */
import { CloudUploadOutlined, CopyOutlined, DownloadOutlined, ImportOutlined, UploadOutlined } from '@ant-design/icons';
import { Button, Col, Input, Row, Select, Switch, Upload, message, Table, Modal } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import * as XLSX from 'xlsx';
import ProductItem from './component/ProductItem';
import { v4 as uuidv4 } from 'uuid';

const { Column } = Table;


const crawlerOptions = [
  {
    value: 'Etsy',
    label: 'Etsy',
  },
  {
    value: 'Woo',
    label: 'Woo',
  },
  {
    value: 'Shopify',
    label: 'Shopify',
  },
  {
    value: 'Shopbase',
    label: 'Shopbase',
  },
  // {
  //   value: 'Amazone',
  //   label: 'Amazone',
  // },
];

const imageLimitOptions = [
  {
    value: 9,
    label: 'Limit 9 images',
  },
  {
    value: 8,
    label: 'Limit 8 images',
  },
  {
    value: 7,
    label: 'Limit 7 images',
  },
  {
    value: 6,
    label: 'Limit 6 images',
  },
  {
    value: 5,
    label: 'Limit 5 images',
  },
  {
    value: 4,
    label: 'Limit 4 images',
  },
  {
    value: 3,
    label: 'Limit 3 images',
  },
  {
    value: 2,
    label: 'Limit 2 images',
  },
  {
    value: 1,
    label: 'Limit 1 images',
  },
];

const initialCrawl = {
  url: '',
  crawler: 'Etsy',
  imagesLimit: 9,
};

const downloadTypeOption = [
  {
    label: 'Excel',
    value: 'excel',
  }

]

export default function Crawl() {
  const productListStorageString = localStorage.getItem('productList');
  const productListStorage = productListStorageString ? JSON.parse(productListStorageString) : [];
  const userInfo = JSON.parse(localStorage.getItem('user'));
  const [productList, setProductList] = useState(productListStorage);
  const [checkedItems, setCheckedItems] = useState([]);
  const [isAllChecked, setIsAllChecked] = useState(false);
  const [optionCrawl, setOptionCrawl] = useState(initialCrawl);
  const [loading, setLoading] = useState(false);
  const [isShowModalUpload, setShowModalUpload] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [showOutsideImages, setShowOutsideImages] = useState(false);
  const [licenseCode, setLicenseCode] = useState({
    code: localStorage.getItem('licenseCode'),
    invalid: !localStorage.getItem('licenseCode'),
  });
  const [modalErrorInfo, setModalErrorInfo] = useState({
    isShow: false,
    data: [],
    title: '',
  });
  const [downloadType, setDownloadType] = useState('excel');
  const sizes = [
    { size: "S", price: 25.9 },
    { size: "M", price: 25.9 },
    { size: "L", price: 25.9 },
    { size: "XL", price: 25.9 },
    { size: "2XL", price: 26.9 },
    { size: "3XL", price: 28.9 },
    { size: "4XL", price: 28.9 },
  ];
  const data = sizes.map((item, index) => ({
    key: index,
    size: item.size,
    price: item.price.toString() // Chuyển đổi giá thành chuỗi để input component có thể hiển thị
  }));
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [tableData, setTableData] = useState(data);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handlePriceChange = (value, index) => {
    const newData = [...tableData];
    newData[index].price = value;
    setTableData(newData);
  };
  console.log("prices", tableData)
  useEffect(() => {
    localStorage.setItem('productList', JSON.stringify(productList));
  }, [productList]);

  useEffect(() => {
    if (checkedItems && checkedItems.length === 0) return;
    const CountSelectedItems = Object.values(checkedItems).filter((value) => value === true).length;
    if (CountSelectedItems === productList.length) {
      setIsAllChecked(true);
    } else setIsAllChecked(false);
  }, [checkedItems]);

  const handleDeleteProduct = (product_id) => {
    const newProductList = productList.filter((item) => item.id !== product_id);
    setProductList(newProductList);
  };

  const handleChangeProduct = (newProduct) => {
    const newProductList = productList.map((item) => {
      if (item.id === newProduct.id) {
        return newProduct;
      }
      return item;
    });
    setProductList(newProductList);
  };

  const handleCheckChange = (event) => {
    setCheckedItems({
      ...checkedItems,
      [event.target.name]: event.target.checked,
    });
  };

  const handleCheckAllChange = (event) => {
    const newCheckedItems = productList.reduce((acc, cur) => {
      acc[cur.id] = event.target.checked;
      return acc;
    }, {});
    setCheckedItems(newCheckedItems);
  };

  const CountSelectedItems = Object.values(checkedItems).filter((value) => value === true).length;

  const renderProductList = () => {
    return (
      <Row gutter={[16, 16]} className="flex py-5 transition-all duration-300">
        {productList.map((item, index) => {
          return (
            <Col span={4} key={item.id}>
              <ProductItem
                product={item}
                index={index}
                handleDeleteProduct={handleDeleteProduct}
                checkedItems={checkedItems}
                handleCheckChange={handleCheckChange}
                handleChangeProduct={handleChangeProduct}
                showSkeleton={showSkeleton}
                showOutsideImages={showOutsideImages}
              />
            </Col>
          );
        })}
      </Row>
    );
  };

  const onChangeOptionCrawl = (key, value) => {
    setOptionCrawl({
      ...optionCrawl,
      [key]: value,
    });
  };

  const fetchInfoProducts = async (ids, productData) => {
    setLoading(true);
    const headers = {
      accept: 'application/json',
      authority: 'vk1ng.com',
      'accept-language': 'vi,vi-VN;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      authorization: `Bearer ${licenseCode.code}`,
      referer: 'https://www.etsy.com/',
      'sec-ch-ua-mobile': '?0',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'cross-site',
      'sec-ch-ua-platform': 'Windows',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
    };
    fetch(`https://vk1ng.com/api/bulk/listings/${ids}`, {
      method: 'GET',
      headers,
    })
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        if (data.message === 'Unauthenticated.') {
          message.error('Please enter the correct lincense code!');
          setLicenseCode({ code: '', invalid: true });
          return;
        }
        const combineProducts = productData.map((item) => {
          const product = data.data.find((product) => item.siteProductId === String(product.listing_id));
          return {
            ...item,
            ...product,
          };
        });
        setProductList(combineProducts);
        // localStorage.setItem('productList', JSON.stringify(combineProducts));
      })
      .catch((error) => {
        message.error(error?.data?.message);
      })
      .finally(() => {
        setLoading(false);
        setShowSkeleton(false);
      });
  };

  const fetchDataProductList = async (url, crawler) => {
    setLoading(true);
    // lấy danh sách url từ textarea và split theo dòng
    const urlsList = url
      .trim()
      .split('\n')
      .filter((line) => line.trim() !== '');

    // nếu url không bắt đầu bằng http thì là id sản phẩm -> thêm đầu link etsy
    const urls = urlsList.map((url) => (url.startsWith('http') ? url : `https://www.etsy.com/listing/${url}`));
    const params = {
      crawler,
    };
    const fetchProductList = async (url) => {
      return axios({
        method: 'post',
        url: `https://kaa.iamzic.com/api/v1/crawl.json?crawlURL=${url}`,
        data: params,
      }).catch((error) => ({ error }));
    };

    // gọi đồng thời các request lấy dữ liệu sản phẩm
    const responses = await Promise.allSettled(urls.map((url) => fetchProductList(url)));

    // concat các sản phẩm vào chung 1 mảng
    const productData = responses
      .filter((response) => response.status === 'fulfilled' && response.value.data)
      .reduce((acc, response) => {
        const { data } = response.value;
        return [...acc, ...data.data];
      }, []);

    // giới hạn ảnh theo imagesLimit
    productData.forEach((product) => {
      product.images = product.images.slice(0, optionCrawl.imagesLimit);
      // kiểm tra từng phần tử trong product.images, nếu url chứa 'https://i.etsystatic.com' thì giảm dung lượng link ảnh bằng 1200x1200
      // const newImages = product.images.map((image) => {
      //   if (image.url.includes('https://i.etsystatic.com')) {
      //     return {
      //       ...image,
      //       url: image.url.replace('fullxfull', '1200x1200'),
      //     };
      //   }
      //   return image;
      // });
      // product.images = newImages;
    });

    // lấy danh sách id của sản phẩm để get thông tin sản phẩm
    const ids = productData.map((item) => item.id.split('.')[0]).join(',');
    setProductList(productData);
    setCheckedItems([]);
    setIsAllChecked(false);
    setShowSkeleton(true);
    if (optionCrawl.crawler === 'Etsy') fetchInfoProducts(ids, productData);
    else {
      setLoading(false);
      setShowSkeleton(false);
    }
  };

  const handleCrawl = () => {
    if (!optionCrawl.url) return;
    fetchDataProductList(optionCrawl.url, optionCrawl.crawler);
  };

  const convertDataProducts = (isCreateProduct) => {
    const selectedProducts = productList.filter((product) => checkedItems[product.id]);

    const convertImageLink = (images) => {
      const imageObject = images.reduce((obj, link, index) => {
        const key = `image${index + 1}`;
        obj[key] = link.url;
        return obj;
      }, {});
      return imageObject;
    };

    return selectedProducts.map((product) => {
      if (isCreateProduct) {
        return {
          sku: product.sku,
          title: product.title,
          warehouse: '',
          description: product.description || '',
          images: { ...convertImageLink(product.images) },
        };
      }
      return {
        sku: '',
        title: product.title,
        warehouse: '',
        description: product.description || '',
        ...convertImageLink(product.images),
      };
    });
  };

  const convertDataProductsToSenPrints = () => {
    const selectedProducts = productList.filter((product) => checkedItems[product.id]);

    const convertImageLink = (images) => {
      const imageObject = images.reduce((obj, link, index) => {
        const key = `mockup_url_${index + 1}`;
        obj[key] = link.url;
        return obj;
      }, {});
      return imageObject;
    };

    if (downloadType === 'SenPrintsHawaiian') {
      return selectedProducts.flatMap((product) => {
        return {
          campaign_name: `${product.title} ${userInfo?.user_code ? `- ${userInfo.user_code}` : ''}`,
          campaign_desc: senPrintsHawaiiData.campaign_desc,
          collection: '',
          product_sku: senPrintsHawaiiData.product_sku,
          price: senPrintsData[0].price,
          ...convertImageLink(product.images),
        };
      });
    }

    if (downloadType === 'SenPrints3D') {
      return selectedProducts.flatMap((product) => {
        return senPrintsData3D.map((item) => {
          return {
            campaign_name: `${product.title} ${userInfo?.user_code ? `- ${userInfo.user_code}` : ''}`,
            campaign_desc: item.campaign_desc,
            collection: '',
            product_sku: item.product_sku,
            price: item.price,
            ...convertImageLink(product.images),
          };
        });
      });
    }

    return selectedProducts.flatMap((product) => {
      return senPrintsData.map((item) => {
        return {
          campaign_name: `${product.title} ${userInfo?.user_code ? `- ${userInfo.user_code}` : ''}`,
          campaign_desc: item.campaign_desc,
          collection: '',
          product_sku: item.product_sku,
          colors: item.colors,
          price: item.price,
          ...convertImageLink(product.images),
        };
      });
    });
  };

  const handleExportExcel = () => {
    const data = convertDataProducts();
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
    XLSX.writeFile(wb, 'productList.xlsx');
    setCheckedItems([]);
    setIsAllChecked(false);
  };


  const onExportByType = () => {
    if (downloadType === 'excel') handleExportExcel();
  };

  const onSaveLicenseCode = () => {
    localStorage.setItem('licenseCode', licenseCode.code);
    setLicenseCode((prev) => ({ ...prev, invalid: false }));
  };

  const copyToClipboard = (content) => {
    const tempInput = document.createElement('input');
    tempInput.value = content;
    document.body.appendChild(tempInput);

    tempInput.select();
    tempInput.setSelectionRange(0, 99999);

    try {
      document.execCommand('copy');
      message.success(`copied`);
    } catch (err) {
      message.error(`${err} copy!`);
    }

    document.body.removeChild(tempInput);
  };

  const handleFileUpload = (file) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      // chuyển đổi data từ file excel sang json
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      let convertJson = [];
      if (Array.isArray(jsonData) && jsonData.length) {

        convertJson = jsonData.map((item) => {
          const { sku, title, warehouse, description } = item;
          const handleImages = (item) => {
            const images = [];
            for (let i = 1; i <= 9; i++) {
              if (item[`image${i}`] || item[`images${i}`]) {
                images.push({
                  url: item[`image${i}`] || item[`images${i}`],
                  id: uuidv4(),
                });
              }
            }
            return images;
          };

          return {
            id: uuidv4(),
            sku: sku || null,
            title: title || null,
            warehouse: warehouse || null,
            description: description || null,
            images: handleImages(item),
          };
        });
      }
      console.log("conversiondata", convertJson)
      setProductList(convertJson);
    };

    reader.readAsArrayBuffer(file);
    return false;
  };
  const handleFileConvert = (file) => {
    const reader = new FileReader();
    const colors = [
      "Black", "White", "Sand", "Forest Green", "Ash", "Sport Grey", "Light Pink",
      "Light Blue", "Dark Heather", "Army Green", "Daisy", "Red", "Navy", "Dark Brown"
    ];

    const sizeStyles = tableData.map(item => ({
      size: `Unisex T-shirt - ${item.size}`,
      price: item.price
    }));

    reader.onload = (event) => {
      // Convert data from Excel file to JSON
      const data = event.target.result;
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }); // Use header: 1 to get array of arrays

      // Find the index of the columns
      const headers = jsonData[0];
      const productNameIndex = headers.indexOf('product_name');
      const mainImageIndex = headers.indexOf('main_image');
      const imageIndices = [mainImageIndex];
      const categoryIndex = headers.indexOf('category');
      const parcelWeightIndex = headers.indexOf('parcel_weight');
      const parcelLengthIndex = headers.indexOf('parcel_length');
      const parcelWidthIndex = headers.indexOf('parcel_width');
      const parcelHeightIndex = headers.indexOf('parcel_height');
      const colorIndex = headers.indexOf('property_value_1')
      const sizeStyleIndex = headers.indexOf('property_value_2')
      // Find index of columns containing 'warehouse_quantity/' and 'product_property/'
      const warehouseQuantityIndex = headers.findIndex(header => header.includes('warehouse_quantity/'));
      const productPropertyIndex = headers.findIndex(header => header.includes('product_property/100398'));
      const productCotton = headers.indexOf('product_property/100157')
      const priceIndex = headers.indexOf('price')
      // Assuming image_2, image_3, ..., image_8 are in consecutive columns
      for (let i = 2; i <= 8; i++) {
        const colName = `image_${i}`;
        const colIndex = headers.indexOf(colName);
        if (colIndex !== -1) {
          imageIndices.push(colIndex);
        }
      }

      // Initialize convertJson array and copy existing data
      let convertJson = [...jsonData];

      let rowIndex = 6; // Start from the 5th row onward
      productList.forEach((product) => {
        colors.forEach((color) => {
          sizeStyles.forEach((sizeStyle) => {
            if (!convertJson[rowIndex]) {
              convertJson[rowIndex] = []; // Initialize row if it doesn't exist
            }

            // Set the product name
            convertJson[rowIndex][productNameIndex] = product.title;

            // Set the images
            product.images.forEach((image, imgIndex) => {
              if (imgIndex < imageIndices.length) {
                convertJson[rowIndex][imageIndices[imgIndex]] = image.url;
              }
            });

            // Set default values for category, parcel_weight, parcel_length, parcel_width, parcel_height, warehouse_quantity/7360488738243249963, and product_property/100400
            convertJson[rowIndex][categoryIndex] = "T-shirts (601226)";
            convertJson[rowIndex][parcelWeightIndex] = 0.3;
            convertJson[rowIndex][parcelLengthIndex] = 9;
            convertJson[rowIndex][parcelWidthIndex] = 9;
            convertJson[rowIndex][parcelHeightIndex] = 2;
            convertJson[rowIndex][productCotton] = "Cotton"
            // Check if warehouse_quantity/ and product_property/ columns were found
            if (warehouseQuantityIndex !== -1) {
              convertJson[rowIndex][warehouseQuantityIndex] = 16; // Set warehouse_quantity/7360488738243249963 to default value
            }
            if (productPropertyIndex !== -1) {
              convertJson[rowIndex][productPropertyIndex] = "Unisex"; // Set product_property/100400 to 'Unisex'
            }
            convertJson[rowIndex][colorIndex] = color;
            convertJson[rowIndex][sizeStyleIndex] = sizeStyle.size;
            convertJson[rowIndex][priceIndex] = sizeStyle.price
            rowIndex++; // Move to the next row
          });
        });
      });

      // Convert back to Excel and download
      const newSheet = XLSX.utils.json_to_sheet(convertJson, { skipHeader: true });
      const newWorkbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, sheetName);
      XLSX.writeFile(newWorkbook, 'converted_file.xlsx');
    };

    reader.readAsArrayBuffer(file);
  };

  console.log("product list", productList);

  return (
    <div>
      <div className="p-5 bg-[#F7F8F9]">
        {licenseCode.invalid && (
          <div className="flex gap-2 mb-3">


          </div>
        )}
        <div className="flex gap-2 items-center">
          <TextArea
            value={optionCrawl.url}
            placeholder="Paste URL"
            onChange={(e) => onChangeOptionCrawl('url', e.target.value)}
            // onPressEnter={handleCrawl}
            rows={4}
          />
          <Select
            defaultValue="Limit 9 images"
            style={{
              width: 220,
            }}
            onChange={(value) => onChangeOptionCrawl('imagesLimit', value)}
            options={imageLimitOptions}
          />
          <Select
            defaultValue="Etsy"
            style={{
              width: 220,
            }}
            onChange={(value) => onChangeOptionCrawl('crawler', value)}
            options={crawlerOptions}
          />
          <Button type="primary" onClick={handleCrawl} loading={loading}>
            Crawl
          </Button>
        </div>


        <div className="my-6 flex gap-2">
          <Upload accept=".xlsx, .xls" beforeUpload={handleFileUpload} multiple={false}>
            <Button icon={<UploadOutlined />}>Upload File</Button>
          </Upload>
          <Upload accept=".xlsx, .xls" beforeUpload={handleFileConvert} multiple={false}>
            <Button icon={<UploadOutlined />}>Convert File</Button>
          </Upload>

        </div>

        <div className="flex items-center gap-4 mt-4">
          <div className="flex gap-2 items-center">
            <input type="checkbox" onChange={handleCheckAllChange} checked={isAllChecked} className="w-6 h-6" />{' '}
            <p className="font-semibold">Selected all</p>
          </div>
          <div>
            Total: <span className="font-semibold">{productList ? productList.length : 0} products</span>
          </div>
        </div>
        <div className="flex justify-between items-center">
          <div className="flex gap-2 items-center mt-5">
            <Select
              defaultValue="excel"
              style={{
                width: 200,
              }}
              onChange={(value) => setDownloadType(value)}
              options={downloadTypeOption}
            />
            <Button
              type="primary"
              disabled={CountSelectedItems === 0}
              icon={<DownloadOutlined />}
              onClick={onExportByType}
            >
              Export excel
            </Button>

            <div>
              <span className="font-semibold">{CountSelectedItems} products</span>
            </div>
          </div>
          <div className="font-semibold">
            Show the outside images <Switch defaultChecked={false} onChange={() => setShowOutsideImages(!showOutsideImages)} />
          </div>
        </div>
        <div>
          <Button type="primary" onClick={showModal}>
            Change Prices
          </Button>
          <Modal
            title="Size and Price"
            visible={isModalVisible}
            onOk={handleOk}
            onCancel={handleCancel}
          >
            <Table dataSource={tableData} pagination={false}>
              <Column title="Size" dataIndex="size" key="size" />
              <Column
                title="Price"
                key="price"
                render={(text, record, index) => (
                  <Input
                    type="text"
                    value={record.price}
                    onChange={(e) => handlePriceChange(e.target.value, index)}
                  />
                )}
              />
            </Table>
          </Modal>
        </div>
        {productList && productList?.length ? renderProductList() : null}
      </div>



    </div>
  );
}
