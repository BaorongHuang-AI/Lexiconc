import {
  PageContainer, ProCard,

} from '@ant-design/pro-components';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {Image, message} from "antd";
import {go} from "@/pages/About/syntree";


const About: React.FC = () => {

  const [image, setImage] =useState("");

  useEffect(() => {
    console.log("effect");
    handler(14, 35, 10);
  }, []);


  function handler(font_size_update, vert_space_update, hor_space_update) {
    try {
      // Initialize the various options.
      var term_font = "sans-serif ";
      var nonterm_font = "sans-serif ";
      var color = true;
      var term_lines = true;
      // if (document.getElementById("term-ital").checked)
      //   term_font = term_font + "italic ";
      // if (document.getElementById("term-bold").checked)
      //   term_font = term_font + "bold ";
      // if (document.getElementById("nonterm-ital").checked)
      //   nonterm_font = nonterm_font + "italic ";
      // if (document.getElementById("nonterm-bold").checked)
      //   nonterm_font = nonterm_font + "bold ";
      // if (document.getElementById("color-check").checked)
      //   color = true;
      // if (document.getElementById("term-lines").checked)
      //   term_lines = true;
      let font_size = 12;
      let vert_space = 30;
      let hor_space = 20;
      // let color = true;
      // let term_lines = true;
      if (font_size_update) font_size = font_size_update;
      if (vert_space_update) vert_space = vert_space_update;
      if (hor_space_update) hor_space = hor_space_update;
      term_font = font_size + "pt sans-serif";
      nonterm_font = font_size + "pt sans-serif";
      // term_font = term_font;
      // nonterm_font = nonterm_font;

      // Get the string.
      var str = "[S [NP This] [VP [V is] [^NP a wug]]]";
      // str ="[S [X Movement] [Y example ]]";

      console.log(str + ", " + font_size + ", " +
        term_font + ", " + nonterm_font + ", " + vert_space + ", " + hor_space);

      var img = go(str, font_size, term_font, nonterm_font, vert_space, hor_space, color, term_lines);
      // console.log('image', img);
      setImage(img);
      // $("#image-goes-here").empty();
      // $("#image-goes-here").append(img);

    } catch (err) {
        console.log(err);
        if (err == "canvas") {
          message.warn("not supported");
        }
    } // try-catch
    return false;
  }

  return (
    <PageContainer>
      <ProCard>
    <h3>iConc is produced by Baorong Huang.</h3>
    <h3>The concordancer feature is based on the python scripts developed by Yongfu Liao.</h3>
      </ProCard>
    </PageContainer>
  );
};

export default About;
