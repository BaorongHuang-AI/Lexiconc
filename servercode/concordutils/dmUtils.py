import os
import re

import pandas as pd


# def calculate_freq(row, keyword):
#     import re
#     # print(keyword)
#     return len(re.findall(keyword, row))
def calculate_freq(rowContent, keyword):
    regex = re.compile("\\b" + re.escape(keyword) + "\\b")
    results = regex.findall(rowContent)
    # str_len = len(rowContent)
    # sub_len = len(keyword)
    # occurence_count = 0
    # for temp in range(str_len - sub_len):
    #     index = rowContent.find(keyword, temp, temp + sub_len)
    #     if index != -1:
    #         occurence_count +=1
    #     else:
    #         continue
    # return occurence_count
    return len(results)

def compute_dm_div_from_file(fileContent_df, dm_df):
   # textfile = open('corpus.txt','r')
   freq_dict = dict()
   for index, item in dm_df.iterrows():
       keyword = item['Discourse Marker']
       if item['Discourse Marker'] + " Frequency" not in fileContent_df.columns:
           fileContent_df[item['Discourse Marker'] + " Frequency"] = fileContent_df['Content'].apply(
               calculate_freq, args=(keyword,))
   outputs = []
   for index, item in fileContent_df.iterrows():
       total = 0
       distinct_no = 0
       for index, innerItem in dm_df.iterrows():
           keyword = innerItem['Discourse Marker']
           # category = item['Category']
           # subCategory = item['Sub-Category']
           if item[keyword + " Frequency"] > 0:
               total = total + item[keyword + " Frequency"]
               distinct_no = distinct_no + 1

           # print(keyword, results_df[keyword+" Frequency"].sum(), results_df[results_df[keyword + " Frequency"] >0][keyword + " Frequency"].count())
       outputs.append([item['File Name'], total, distinct_no])
   output_df = pd.DataFrame(data=outputs, columns=['File Name', "Frequency", "Diversity"])
   output_df.rename(
       columns={'File Name': 'fileName'},
       inplace=True)
   # freq_results_fdist = output_df[output_df['Frequency'] >= minfreq]
   # if len(filter_word) > 0:
   #     freq_results_fdist = freq_results_fdist[
   #         freq_results_fdist['Lexical Bundles'].str.contains(filter_word)]
   # print(fileContent_df.head(10))
   return output_df

def compute_dm_freq_from_file(file_content, dm_df, minfreq=1, filter_word=''):
   # textfile = open('corpus.txt','r')
   file_content = file_content.replace("\n", " ")
   freq_dict = dict()
   for index, item in dm_df.iterrows():
       keyword = item['Discourse Marker']
       word = item['Discourse Marker'] + "^^" + item['Category'] + "^^" + item['Sub-Category']
       count = len(re.findall(keyword, file_content))
       freq_dict[word] = freq_dict.get(word, 0) + count
   results = []
   for item in freq_dict.keys():
       entries = item.split("^^")
       results.append([entries[0], entries[1], entries[2], freq_dict[item]])
   df = pd.DataFrame(data=results, columns=["Discourse Marker", "Category", "Sub-category", "Frequency"])
   dm_freq_results_fdist = df[df['Frequency'] >= minfreq]
   if len(filter_word) > 0:
       dm_freq_results_fdist = dm_freq_results_fdist[
           dm_freq_results_fdist['Discourse Marker'].str.contains(filter_word)]
   dm_freq_results_fdist.rename(columns={'Discourse Marker': 'DiscourseMarker', "Sub-category":"Subcategory"}, inplace=True)
   return dm_freq_results_fdist



def compute_dm_freq_by_file(fileContent_df, dm_df):
    for index, item in dm_df.iterrows():
        keyword = item['Discourse Marker']
        if item['Discourse Marker'] + " Frequency" not in fileContent_df.columns:
            fileContent_df[item['Discourse Marker'] + " Frequency"] = fileContent_df['Content'].apply(
                calculate_freq, args=(keyword,))
        # fileContent_df[item['Lexical Bundles'] +" Frequency"] = fileContent_df['Content'].parallel_apply(calculate_freq, args=(keyword,) )
    outputs = []
    for index, item in dm_df.iterrows():
        keyword = item['Discourse Marker']
        category = item['Category']
        subCategory = item['Sub-Category']
        # print(keyword, results_df[keyword+" Frequency"].sum(), results_df[results_df[keyword + " Frequency"] >0][keyword + " Frequency"].count())
        outputs.append([keyword, category, subCategory, fileContent_df[keyword + " Frequency"].sum(),
                        fileContent_df[fileContent_df[keyword + " Frequency"] > 0][keyword + " Frequency"].count()])
    output_df = pd.DataFrame(data=outputs, columns=['Discourse Marker', "Category",  'Sub-Category', "Frequency", "Diversity"])
    output_df.rename(columns={'Discourse Marker': 'DiscourseMarker', "Category": "category", "Sub-Category": "subCategory"},
                                 inplace=True)

    # freq_results_fdist = output_df[output_df['Frequency'] >= minfreq]
    # if len(filter_word) > 0:
    #     freq_results_fdist = freq_results_fdist[
    #         freq_results_fdist['Lexical Bundles'].str.contains(filter_word)]
    # print(fileContent_df.head(10))
    return output_df


if __name__ == '__main__':
    dm_df = pd.read_excel("Discourse Marker List Demo.xlsx")
    # with open("corpus.txt", "r", encoding="utf8") as f:
    #     content = f.read()
    #
    # print(compute_dm_freq_from_file(content, dm_df, 2, ""))
    currentFiles = []
    results = []
    i = 1
    dirStr = "data"
    for file in os.listdir(dirStr):
        if not file.endswith('.txt'):
            continue
        currentFiles.append(os.path.join(dirStr, file))
    # for item in currentFiles:
    #     results.append([os.path.basename(item), get_file_content(item)])
    # fileContent_df = pd.DataFrame(data=results, columns=["File Name", "Content"])
    #
    # # output_df = compute_lb_freq_from_file(fileContent_df, dm_df)
    # output_df = compute_dm_freq_by_file(fileContent_df, dm_df)
    # print(output_df)
