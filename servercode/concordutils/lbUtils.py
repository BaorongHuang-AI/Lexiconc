import os
import re

import pandas as pd

def calculate_freq(rowContent, keyword):
    # regex = re.compile("\\b" + keyword + "\\b")
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

def fastest_calculate_freq(rowContent, keyword):
    count = 0
    str_len = len(rowContent)
    sub_len = len(keyword)
    occurence_count = 0
    keyword = " " + keyword + " "
    for temp in range(str_len - sub_len):
        index = rowContent.find(keyword, temp, temp + sub_len)
        if index != -1:
            occurence_count +=1
        else:
            continue
    return occurence_count

def fast_calculate_freq(rowContent, keyword):
    regex = re.compile("\\b" + keyword + "\\b")
    results = regex.findall(rowContent)
    keyword_entries = keyword.split()
    row_entries = rowContent.split()
    count = 0
    if len(keyword_entries) == 1:
        for item in row_entries:
            if keyword == item:
                count +=1
    else:
        for i in range(0, len(row_entries)):
            new_entry_list = row_entries[i:i+len(keyword_entries)]
            new_entry = " ".join(new_entry_list)
            if keyword == new_entry:
                count += 1
            i +=len(keyword_entries)

    return count

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


def compute_lb_freq_from_file(fileContent_df, lb_df, minfreq=1, filter_word=''):
   for index, item in lb_df.iterrows():
       keyword = item['Lexical Bundles']
       if item['Lexical Bundles'] + " Frequency" not in fileContent_df.columns:
           fileContent_df[item['Lexical Bundles'] + " Frequency"] = fileContent_df['Content'].apply(
               calculate_freq, args=(keyword,))
   outputs = []
   for index, item in lb_df.iterrows():
       keyword = item['Lexical Bundles']
       outputs.append([keyword, fileContent_df[keyword + " Frequency"].sum(),
                       fileContent_df[fileContent_df[keyword + " Frequency"] > 0][keyword + " Frequency"].count()])
   output_df = pd.DataFrame(data=outputs, columns=['Lexical Bundles', "Frequency", "Diversity"])
   output_df.rename(columns={'Lexical Bundles': 'lexicalBundles'}, inplace=True)
   return output_df


def compute_lb_div_from_file(fileContent_df, lb_df, minfreq=1, filter_word=''):
   for index, item in lb_df.iterrows():
       keyword = item['Lexical Bundles']
       if item['Lexical Bundles'] + " Frequency" not in fileContent_df.columns:
           fileContent_df[item['Lexical Bundles'] + " Frequency"] = fileContent_df['Content'].apply(
               calculate_freq, args=(keyword,))
   outputs = []
   for index, item in fileContent_df.iterrows():
       total = 0
       distinct_no = 0
       for index, innerItem in lb_df.iterrows():
           keyword = innerItem['Lexical Bundles']
           if item[keyword + " Frequency"] > 0:
               total = total + item[keyword + " Frequency"]
               distinct_no = distinct_no + 1
       outputs.append([item['File Name'], total, distinct_no])
   output_df = pd.DataFrame(data=outputs, columns=['File Name', "Frequency", "Diversity"])
   output_df.rename(columns={'File Name': 'fileName'}, inplace=True)


   return output_df


if __name__ == '__main__':
    myStr = "free python I am pythonforbeginners . free python python I I provide free python tutorials for you to learn python . free python I am pythonforbeginners . I provide free python tutorials for you to learn python ."
    substring = "free python I"
    count = fast_calculate_freq(myStr, substring)
    print(count)
    # fileContent_df = pd.DataFrame(data=results, columns=["File Name", "Content"])
    #
    # # output_df = compute_lb_freq_from_file(fileContent_df, dm_df)
    # output_df = compute_lb_div_from_file(fileContent_df,dm_df)

