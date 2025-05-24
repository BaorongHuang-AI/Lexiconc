import pandas as pd

from concordutils.dmUtils import compute_dm_freq_from_file, compute_dm_freq_by_file, compute_dm_div_from_file
from concordutils.lbUtils import compute_lb_freq_from_file, compute_lb_div_from_file




def cal_dm_stats(file_content_list, dm_list):
    lb_df = pd.DataFrame(data=dm_list, columns=[ 'Discourse Marker', 'Category', 'Sub-Category'])
    file_content_df = pd.DataFrame(data=file_content_list, columns=['File Name', 'Content'])
    freq_df = compute_dm_freq_by_file(file_content_df, lb_df)
    diversity_df = compute_dm_div_from_file(file_content_df, lb_df)
    return {"dmFreq": freq_df.to_json(orient='records'),
            "dmDiversity": diversity_df.to_json(orient='records')}