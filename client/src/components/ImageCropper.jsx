import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { Modal, Button, Slider } from 'antd';

const ImageCropper = ({ image, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedArea, setCroppedArea] = useState(null);

  const onCropChange = useCallback((crop) => {
    setCrop(crop);
  }, []);

  const onZoomChange = useCallback((zoom) => {
    setZoom(zoom);
  }, []);

  const handleCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedArea(croppedAreaPixels);
  }, []);

  const handleSave = () => {
    onCropComplete(croppedArea);
  };

  return (
    <Modal
      visible={true}
      title="Crop Image"
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Cancel
        </Button>,
        <Button key="save" type="primary" onClick={handleSave}>
          Save
        </Button>
      ]}
      width={600}
    >
      <div style={{ position: 'relative', height: 400, marginBottom: 16 }}>
        <Cropper
          image={image}
          crop={crop}
          zoom={zoom}
          aspect={1}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={handleCropComplete}
        />
      </div>
      <Slider
        value={zoom}
        min={1}
        max={3}
        step={0.1}
        onChange={onZoomChange}
      />
    </Modal>
  );
};

export default ImageCropper;
