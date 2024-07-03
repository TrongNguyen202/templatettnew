import { CreditCardOutlined, DeleteOutlined, EyeOutlined, HourglassOutlined, StarOutlined } from '@ant-design/icons';
import { Input, Modal, Skeleton, Tag, Tooltip, Upload } from 'antd';
import React, { useEffect, useState } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { DndContext, PointerSensor, useSensor } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ModalProductDetail from './ModalProductDetail';

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

function DraggableUploadListItem({ originNode, file }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: file.uid,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={isDragging ? 'is-dragging h-[100%] w-[100%]' : ' h-[100%] w-[100%]'}
      {...attributes}
      {...listeners}
    >
      {file.status === 'error' && isDragging ? originNode.props.children : originNode}
    </div>
  );
}

export default function ProductItem({
  product,
  index,
  handleDeleteProduct,
  checkedItems,
  handleCheckChange,
  handleChangeProduct,
  showSkeleton,
  showOutsideImages,
}) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [fileList, setFileList] = useState(product.images);
  const [productSku, setProductSku] = useState(product.sku);
  const [productTitle, setProductTitle] = useState(product.title);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const {
    listing_id,
    last_modified,
    sold,
    total_sold,
    views,
    views_24h,
    original_creation,
    estimated_revenue,
    daily_views,
    num_favorers,
    hey,
  } = product ?? {};

  useEffect(() => {
    handleChangeProduct({ ...product, images: fileList });
  }, [fileList]);

  useEffect(() => {
    setFileList(product.images);
  }, [product.images]);

  useEffect(() => {
    setProductSku(product.sku);
  }, [product.sku]);

  useEffect(() => {
    setProductTitle(product.title);
  }, [product.title]);

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) file.preview = await getBase64(file.originFileObj);
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(file.name || file.url.substring(file.url.lastIndexOf('/') + 1));
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    // imgBase64(newFileList);
  };

  const sensor = useSensor(PointerSensor, {
    activationConstraint: {
      distance: 10,
    },
  });

  const handleCancel = () => setPreviewOpen(false);

  const onDragEnd = ({ active, over }) => {
    if (active.id !== over?.id) {
      setFileList((prev) => {
        const activeIndex = prev.findIndex((i) => i.uid === active.id);
        const overIndex = prev.findIndex((i) => i.uid === over?.id);
        return arrayMove(prev, activeIndex, overIndex);
      });
    }
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-md hover:shadow-blue-300 duration-300 hover:translate-y-[-5px] h-full">
      <div className="w-[100%] h-[13vw] relative">
        <LazyLoadImage
          src={product?.images[0]?.url}
          alt="Image main"
          className="w-full h-full object-cover cursor-pointer"
          onClick={() => setIsOpenModal(true)}
          loading="lazy"
        />
        <input
          type="checkbox"
          name={product.id}
          checked={!!checkedItems[product.id]}
          onChange={handleCheckChange}
          className="absolute top-2 left-2 cursor-pointer w-6 h-6"
        />
        <Tooltip title={`Có ${product?.images?.length} ảnh`} placement="top">
          <p className="absolute font-medium h-7 w-7 flex justify-center items-center rounded-md bg-gray-100 bottom-3 right-2 text-green-600 shadow-md border-gray-300 border-solid border-[1px]">
            {product?.images?.length}
          </p>
        </Tooltip>
        <p
          className="absolute top-2 right-2 cursor-pointer text-red-500 text-[16px] h-7 w-7 flex justify-center items-center bg-gray-100 rounded-md hover:bg-slate-200"
          onClick={() => handleDeleteProduct(product.id)}
        >
          <Tooltip title="Xóa" placement="top">
            <DeleteOutlined />
          </Tooltip>
        </p>
      </div>
      <div className="p-2">
        <a className="h-[20px] webkit-box text-black line-clamp-1" href={product.url} target="blank">
          {product.title}
        </a>
        <div className="flex justify-between items-center mt-2">
          <p
            className="h-[30px] w-[30px] flex justify-center items-center border-[1px] border-solid rounded-lg text-yellow-600 cursor-pointer hover:bg-yellow-100 duration-300"
            onClick={() => setIsOpenModal(true)}
          >
            {index + 1}
          </p>
          <p className="font-semibold text-green-600">${product.price}</p>
        </div>
      </div>
      <div className="p-2 my-2 mb-0">
      
      </div>
      <div className="p-2 mb-2 mt-0">
        <Input
          value={productTitle}
          onChange={(e) => setProductTitle(e.target.value)}
          placeholder="Enter title product here"
          onBlur={(e) => handleChangeProduct({ ...product, title: e.target.value })}
        />
      </div>
      <div className={`flex justify-center px-2 ${showOutsideImages ? 'block' : 'hidden'}`}>
        <DndContext sensors={[sensor]} onDragEnd={onDragEnd}>
          <SortableContext items={fileList?.map((i) => i.uid)} strategy={verticalListSortingStrategy}>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleChange}
              beforeUpload={() => false}
              previewFile={getBase64}
              multiple
              // eslint-disable-next-line react/no-unstable-nested-components
              itemRender={(originNode, file) => <DraggableUploadListItem originNode={originNode} file={file} />}
            >
              {/* {fileList?.length >= 8 ? null : (
                <button style={{ border: 0, background: "none" }} type="button">
                  <PlusOutlined />
                  <div style={{ marginTop: 8 }}> Upload</div>
                </button>
              )} */}
            </Upload>
          </SortableContext>
        </DndContext>
      </div>
      {listing_id ? (
        <div className="rounded-md flex flex-col gap-1 p-2 px-3 text-[14px] font-semibold">
          <div className="flex justify-between gap-1">
            <Tooltip title="Show in the Last 24 Hours" placement="top">
              <Tag color="#22C55E" className="w-full py-[3px] text-[14px] flex-1 mr-0" icon={<StarOutlined />}>
                {sold}+ Sold
              </Tag>
            </Tooltip>
            <Tooltip title="Views in the Last 24 Hours" placement="top">
              <Tag color="#F97316" className="w-full py-[3px] text-[14px] flex-1 mr-0" icon={<EyeOutlined />}>
                {views_24h}+ Views
              </Tag>
            </Tooltip>
          </div>
          <div className="flex justify-between gap-1">
            <Tooltip title="Estimated Total Sales" placement="top">
              <Tag color="#3B82F6" className="w-full py-[3px] text-[14px] flex-1 mr-0" icon={<HourglassOutlined />}>
                {total_sold}+ Sold
              </Tag>
            </Tooltip>
            <Tooltip title="Estimated Revenue" placement="top">
              <Tag color="#A855F7" className="w-full py-[3px] text-[14px] flex-1 mr-0" icon={<CreditCardOutlined />}>
                {estimated_revenue}
              </Tag>
            </Tooltip>
          </div>
          <div className="mt-3 flex-1">
            {/* views */}
            <div className="flex justify-between border-b-[1px] border-solid border-gray-300 border-l-0 border-r-0 border-t-0 py-2">
              <p className="w-[60px]">Views</p>
              <Tooltip title="This is the estimate average daily view" placement="top">
                <p className="text-[#e11d48] text-center">{daily_views}(Avg)</p>
              </Tooltip>
              <Tooltip title="This is the estimate average daily view" placement="top">
                <p className="text-[#e11d48]">{views}</p>
              </Tooltip>
            </div>
            {/* Favorites */}
            <div className="flex justify-between border-b-[1px] border-solid border-gray-300 border-l-0 border-r-0 border-t-0 py-2">
              <p>Favorites</p>
              <Tooltip title="This is the estimate average daily view" placement="top">
                <p className="text-[#2563eb] text-center">{hey}%</p>
              </Tooltip>
              <Tooltip title="Total number of favorites for this listing" placement="top">
                <p className="text-[#2563eb]">{num_favorers}</p>
              </Tooltip>
            </div>
            {/* Created */}
            <div className="flex justify-between border-b-[1px] border-solid border-gray-300 border-l-0 border-r-0 border-t-0 py-2">
              <p>Created</p>
              <Tooltip title="This listing was create" placement="top">
                <p className="text-[#0d9488] text-center">{original_creation}</p>
              </Tooltip>
            </div>
            {/* Updated */}
            <div className="flex justify-between  py-2">
              <p>Updated</p>
              <Tooltip title="When it is sold, reviewed, or updateed" placement="top">
                <p className="text-[#0d9488] text-center">{last_modified}</p>
              </Tooltip>
            </div>
          </div>
        </div>
      ) : null}
      {showSkeleton && <Skeleton className="px-3 py-2" active />}

      {isOpenModal && (
        <ModalProductDetail
          product={product}
          setIsOpenModal={setIsOpenModal}
          isOpenModal={isOpenModal}
          handleChangeProduct={handleChangeProduct}
        />
      )}

      <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancel}>
        <img alt={previewTitle} style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
}
