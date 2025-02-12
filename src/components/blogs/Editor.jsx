/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import "froala-editor/css/froala_style.min.css";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/js/plugins.pkgd.min.js";

import FroalaEditorComponent from "react-froala-wysiwyg";

import "froala-editor/js/third_party/image_tui.min.js";
// import "froala-editor/js/third_party/embedly.min.js";

import "font-awesome/css/font-awesome.css";
import "froala-editor/js/third_party/font_awesome.min.js";

import FroalaEditorView from "react-froala-wysiwyg/FroalaEditorView";
import { supabaseClient } from "../../supabase/client";

const Editor = ({ onChange, data }) => {
  const uploadImageToSupabase = async (file) => {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabaseClient.storage
      .from("blogs")
      .upload(`images/${fileName}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return null;
    }

    const request = supabaseClient.storage
      .from("blogs")
      .getPublicUrl(`images/${fileName}`);

    const { publicUrl } = request.data;
    console.log(request.data);
    return publicUrl;
  };

  const config = {
    heightMin: 400,
    heightMax: 500,
    placeholderText: "Edit Your Content Here!",
    charCounterCount: false,
    imageUpload: true,
    imageAllowedTypes: ["jpeg", "jpg", "png", "gif"],
    imageUploadMethod: "PUT",
    imageUploadToS3: false,

    events: {
      "image.beforeUpload": async function (files) {
        console.log("uploading...");
        if (files.length) {
          const imageURL = await uploadImageToSupabase(files[0]);
          console.log(imageURL);
          if (imageURL) {
            this.image.insert(imageURL, null, null, this.image.get());
          }
          return false;
        }
      },
      contentChanged: function () {},
      initialized: function () {
        if (data !== null) {
          this.html.set(data);
        }
      },
    },
  };

  return (
    <div className="">
      <h2></h2>

      <FroalaEditorComponent
        tag="textarea"
        config={config}
        model={data}
        onModelChange={(newContent) => onChange(newContent)}
      />
    </div>
  );
};

export default Editor;
